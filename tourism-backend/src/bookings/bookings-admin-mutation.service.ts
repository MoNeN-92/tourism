import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  BookingServiceStatus,
  BookingStatus,
  CarType,
  Currency,
  PartnerType,
  PaymentAmountMode,
  Prisma,
  RoomType,
} from '@prisma/client';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminUpdateBookingDto } from './dto/admin-update-booking.dto';
import {
  AdminBookingHotelServiceDto,
  AdminBookingTourDto,
  AdminCreateBookingDto,
} from './dto/admin-create-booking.dto';
import {
  AdminBookingRecord,
  BOOKING_ADMIN_INCLUDE,
  hasText,
  NormalizedHotelService,
  NormalizedTourService,
  normalizeNullableString,
  normalizePercent,
  parseBookingDateInput,
  safeAmount,
  toDateOnly,
  withBalance,
} from './bookings.shared';

@Injectable()
export class BookingsAdminMutationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private async findAdminBookingOrThrow(id: string): Promise<AdminBookingRecord> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_ADMIN_INCLUDE,
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  private async validateTourExists(tourId: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }
  }

  private async validateUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async validatePartnerAssignment(userId: string, partnerType: PartnerType) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        partnerType: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Assigned partner must be active');
    }

    if (user.partnerType !== partnerType) {
      const label = partnerType === PartnerType.DRIVER ? 'Driver' : 'Guide';
      throw new BadRequestException(`${label} assignment requires a matching partner type`);
    }
  }

  private parseHotelDates(input: {
    checkIn?: string | null;
    checkOut?: string | null;
  }): { checkIn: Date | null; checkOut: Date | null } {
    const checkIn = input.checkIn ? parseBookingDateInput(input.checkIn) : null;
    const checkOut = input.checkOut ? parseBookingDateInput(input.checkOut) : null;

    if (checkIn && checkOut && checkOut < checkIn) {
      throw new BadRequestException('Hotel check-out date must be after check-in date');
    }

    return { checkIn, checkOut };
  }

  private async findHotelOrThrow(hotelId: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    return hotel;
  }

  private toNormalizedTours(
    tours?: AdminBookingTourDto[] | null,
    fallback?: {
      tourId?: string | null;
      desiredDate?: string | null;
      adults?: number | null;
      children?: number | null;
    },
  ): NormalizedTourService[] {
    if (Array.isArray(tours) && tours.length > 0) {
      return tours.map((item) => ({
        tourId: item.tourId,
        desiredDate: parseBookingDateInput(item.desiredDate),
        adults: item.adults,
        children: item.children,
        carType: item.carType,
        driverId: item.driverId ?? null,
        guideId: item.guideId ?? null,
      }));
    }

    if (fallback?.tourId && fallback?.desiredDate) {
      return [
        {
          tourId: fallback.tourId,
          desiredDate: parseBookingDateInput(fallback.desiredDate),
          adults: fallback.adults ?? 1,
          children: fallback.children ?? 0,
          carType: CarType.SEDAN,
          driverId: null,
          guideId: null,
        },
      ];
    }

    return [];
  }

  private toNormalizedHotelService(
    hotelService?: AdminBookingHotelServiceDto | null,
    fallback?: {
      hotelName?: string | null;
      hotelCheckIn?: string | null;
      hotelCheckOut?: string | null;
      hotelRoomType?: string | null;
      hotelGuests?: number | null;
      hotelNotes?: string | null;
    },
  ): {
    hotelService: NormalizedHotelService | null;
    fallbackHotelName: string | null;
  } {
    if (hotelService) {
      const { checkIn, checkOut } = this.parseHotelDates({
        checkIn: hotelService.checkIn,
        checkOut: hotelService.checkOut,
      });

      const rooms = (hotelService.rooms || [])
        .map((room) => ({
          roomType: room.roomType.trim(),
          guestCount: room.guestCount,
        }))
        .filter((room) => room.roomType.length > 0);

      return {
        hotelService: {
          hotelId: hotelService.hotelId,
          checkIn,
          checkOut,
          notes: normalizeNullableString(hotelService.notes),
          sendRequestToHotel: Boolean(hotelService.sendRequestToHotel),
          rooms: rooms.length > 0 ? rooms : [{ roomType: 'Standard', guestCount: 1 }],
        },
        fallbackHotelName: null,
      };
    }

    const hasLegacyHotel =
      hasText(fallback?.hotelName) ||
      Boolean(fallback?.hotelCheckIn) ||
      Boolean(fallback?.hotelCheckOut) ||
      hasText(fallback?.hotelRoomType) ||
      fallback?.hotelGuests !== undefined;

    if (!hasLegacyHotel) {
      return {
        hotelService: null,
        fallbackHotelName: null,
      };
    }

    if (!hasText(fallback?.hotelName)) {
      throw new BadRequestException('Hotel name is required when hotel service is provided');
    }

    this.parseHotelDates({
      checkIn: fallback?.hotelCheckIn ?? null,
      checkOut: fallback?.hotelCheckOut ?? null,
    });

    return {
      hotelService: null,
      fallbackHotelName: normalizeNullableString(fallback?.hotelName),
    };
  }

  private resolvePaidAmounts(params: {
    totalPrice: number;
    amountPaid?: number;
    amountPaidMode?: PaymentAmountMode;
    amountPaidPercent?: number | null;
    fallback?: {
      amountPaid: number;
      amountPaidMode: PaymentAmountMode;
      amountPaidPercent: number | null;
    };
  }) {
    const totalPrice = safeAmount(params.totalPrice);
    const mode = params.amountPaidMode ?? params.fallback?.amountPaidMode ?? PaymentAmountMode.FLAT;

    if (mode === PaymentAmountMode.PERCENT) {
      const percent = normalizePercent(
        params.amountPaidPercent ?? params.fallback?.amountPaidPercent ?? 0,
      );
      const amountPaid = (totalPrice * (percent ?? 0)) / 100;

      return {
        totalPrice,
        amountPaid,
        amountPaidMode: mode,
        amountPaidPercent: percent,
      };
    }

    const amountPaid = safeAmount(params.amountPaid ?? params.fallback?.amountPaid ?? 0);

    return {
      totalPrice,
      amountPaid,
      amountPaidMode: mode,
      amountPaidPercent: params.amountPaidPercent ?? params.fallback?.amountPaidPercent ?? null,
    };
  }

  private getLegacySummaryFromTours(tours: NormalizedTourService[]) {
    if (tours.length === 0) {
      return {
        tourId: null,
        desiredDate: null,
        adults: null,
        children: null,
      };
    }

    const firstTour = tours[0];

    return {
      tourId: firstTour.tourId,
      desiredDate: firstTour.desiredDate,
      adults: firstTour.adults,
      children: firstTour.children,
    };
  }

  private getLegacySummaryFromHotel(params: {
    hotelName?: string | null;
    hotelCheckIn?: Date | null;
    hotelCheckOut?: Date | null;
    hotelNotes?: string | null;
    hotelRoomType?: string | null;
    hotelGuests?: number | null;
    normalizedHotel?: NormalizedHotelService | null;
    resolvedHotelName?: string | null;
  }) {
    const firstRoom = params.normalizedHotel?.rooms?.[0];

    return {
      hotelName: params.resolvedHotelName ?? params.hotelName ?? null,
      hotelCheckIn: params.normalizedHotel?.checkIn ?? params.hotelCheckIn ?? null,
      hotelCheckOut: params.normalizedHotel?.checkOut ?? params.hotelCheckOut ?? null,
      hotelRoomType: firstRoom?.roomType ?? params.hotelRoomType ?? null,
      hotelGuests: firstRoom?.guestCount ?? params.hotelGuests ?? null,
      hotelNotes: params.normalizedHotel?.notes ?? params.hotelNotes ?? null,
    };
  }

  private mapBooking(record: AdminBookingRecord) {
    return withBalance(record);
  }

  async createAdmin(dto: AdminCreateBookingDto) {
    const guestName = normalizeNullableString(dto.guestName);
    const guestEmail = normalizeNullableString(dto.guestEmail);
    const guestPhone = normalizeNullableString(dto.guestPhone);

    if (!dto.userId && !guestName && !guestEmail && !guestPhone) {
      throw new BadRequestException('Provide either an existing user or guest details');
    }

    if (dto.userId) {
      await this.validateUserExists(dto.userId);
    }

    const normalizedTours = this.toNormalizedTours(dto.tours, {
      tourId: dto.tourId,
      desiredDate: dto.desiredDate,
      adults: dto.adults,
      children: dto.children,
    });

    for (const tourItem of normalizedTours) {
      await this.validateTourExists(tourItem.tourId);
      if (tourItem.driverId) {
        await this.validatePartnerAssignment(tourItem.driverId, PartnerType.DRIVER);
      }
      if (tourItem.guideId) {
        await this.validatePartnerAssignment(tourItem.guideId, PartnerType.GUIDE);
      }
    }

    const normalizedHotelResult = this.toNormalizedHotelService(dto.hotelService, {
      hotelName: dto.hotelName,
      hotelCheckIn: dto.hotelCheckIn,
      hotelCheckOut: dto.hotelCheckOut,
      hotelRoomType: dto.hotelRoomType,
      hotelGuests: dto.hotelGuests,
      hotelNotes: dto.hotelNotes,
    });

    let normalizedHotel = normalizedHotelResult.hotelService;
    let resolvedHotel: { id: string; name: string; email: string } | null = null;
    let resolvedHotelName = normalizedHotelResult.fallbackHotelName;

    if (normalizedHotel) {
      resolvedHotel = await this.findHotelOrThrow(normalizedHotel.hotelId);
      resolvedHotelName = resolvedHotel.name;
    }

    const hasTour = normalizedTours.length > 0;
    const hasHotel = Boolean(normalizedHotel || resolvedHotelName);

    if (!hasTour && !hasHotel) {
      throw new BadRequestException('At least one service (tour or hotel) is required');
    }

    const legacyTour = this.getLegacySummaryFromTours(normalizedTours);
    const legacyHotel = this.getLegacySummaryFromHotel({
      hotelName: normalizeNullableString(dto.hotelName),
      hotelCheckIn: dto.hotelCheckIn ? parseBookingDateInput(dto.hotelCheckIn) : null,
      hotelCheckOut: dto.hotelCheckOut ? parseBookingDateInput(dto.hotelCheckOut) : null,
      hotelNotes: normalizeNullableString(dto.hotelNotes),
      hotelRoomType: normalizeNullableString(dto.hotelRoomType),
      hotelGuests: dto.hotelGuests ?? null,
      normalizedHotel,
      resolvedHotelName,
    });

    const payment = this.resolvePaidAmounts({
      totalPrice: safeAmount(dto.totalPrice),
      amountPaid: dto.amountPaid,
      amountPaidMode: dto.amountPaidMode,
      amountPaidPercent: dto.amountPaidPercent,
    });

    if (payment.totalPrice < 0 || payment.amountPaid < 0) {
      throw new BadRequestException('Price values must be greater than or equal to 0');
    }

    const status = dto.status ?? BookingStatus.APPROVED;
    const decisionTimestamp = new Date();

    const record = await this.prisma.booking.create({
      data: {
        userId: dto.userId ?? null,
        guestName,
        guestEmail,
        guestPhone,
        tourId: hasTour ? legacyTour.tourId : null,
        desiredDate: hasTour ? legacyTour.desiredDate : null,
        adults: hasTour ? legacyTour.adults : null,
        children: hasTour ? legacyTour.children : null,
        roomType: hasTour ? dto.roomType ?? RoomType.double : null,
        hotelName: hasHotel ? legacyHotel.hotelName : null,
        hotelCheckIn: hasHotel ? legacyHotel.hotelCheckIn : null,
        hotelCheckOut: hasHotel ? legacyHotel.hotelCheckOut : null,
        hotelRoomType: hasHotel ? legacyHotel.hotelRoomType : null,
        hotelGuests: hasHotel ? legacyHotel.hotelGuests : null,
        hotelNotes: hasHotel ? legacyHotel.hotelNotes : null,
        totalPrice: payment.totalPrice,
        amountPaid: payment.amountPaid,
        currency: dto.currency ?? Currency.GEL,
        amountPaidMode: payment.amountPaidMode,
        amountPaidPercent: payment.amountPaidPercent,
        note: normalizeNullableString(dto.note),
        adminNote: normalizeNullableString(dto.adminNote),
        serviceStatus: dto.serviceStatus ?? ('PENDING' as BookingServiceStatus),
        status,
        approvedAt: status === BookingStatus.APPROVED ? decisionTimestamp : null,
        rejectedAt: status === BookingStatus.REJECTED ? decisionTimestamp : null,
        cancelledAt: status === BookingStatus.CANCELLED ? decisionTimestamp : null,
        ...(normalizedTours.length > 0
          ? {
              tours: {
                create: normalizedTours.map((tourItem) => ({
                  tourId: tourItem.tourId,
                  desiredDate: tourItem.desiredDate,
                  adults: tourItem.adults,
                  children: tourItem.children,
                  carType: tourItem.carType,
                  driverId: tourItem.driverId,
                  guideId: tourItem.guideId,
                })),
              },
            }
          : {}),
        ...(normalizedHotel
          ? {
              hotelService: {
                create: {
                  hotelId: normalizedHotel.hotelId,
                  checkIn: normalizedHotel.checkIn,
                  checkOut: normalizedHotel.checkOut,
                  notes: normalizedHotel.notes,
                  sendRequestToHotel: normalizedHotel.sendRequestToHotel,
                  rooms: {
                    create: normalizedHotel.rooms.map((room) => ({
                      roomType: room.roomType,
                      guestCount: room.guestCount,
                    })),
                  },
                },
              },
            }
          : {}),
      },
      include: BOOKING_ADMIN_INCLUDE,
    });

    if (normalizedHotel?.sendRequestToHotel && resolvedHotel?.email) {
      await this.emailService.sendHotelInquiryEmail({
        recipientEmail: resolvedHotel.email,
        bookingId: record.id,
        hotelName: resolvedHotel.name,
        guestName:
          guestName ||
          (record.user ? `${record.user.firstName} ${record.user.lastName}`.trim() : 'Guest customer'),
      });
    }

    return this.mapBooking(record);
  }

  async updateAdmin(id: string, dto: AdminUpdateBookingDto) {
    const existing = await this.findAdminBookingOrThrow(id);

    if (existing.isDeleted) {
      throw new BadRequestException('Cannot update a deleted booking');
    }

    const nextUserId = dto.userId !== undefined ? dto.userId : existing.userId;
    if (nextUserId) {
      await this.validateUserExists(nextUserId);
    }

    const nextGuestName =
      dto.guestName !== undefined ? normalizeNullableString(dto.guestName) : existing.guestName;
    const nextGuestEmail =
      dto.guestEmail !== undefined ? normalizeNullableString(dto.guestEmail) : existing.guestEmail;
    const nextGuestPhone =
      dto.guestPhone !== undefined ? normalizeNullableString(dto.guestPhone) : existing.guestPhone;

    if (!nextUserId && !nextGuestName && !nextGuestEmail && !nextGuestPhone) {
      throw new BadRequestException('Provide either an existing user or guest details');
    }

    const shouldReplaceTours =
      dto.tours !== undefined ||
      dto.tourId !== undefined ||
      dto.desiredDate !== undefined ||
      dto.adults !== undefined ||
      dto.children !== undefined;

    const shouldReplaceHotel =
      dto.hotelService !== undefined ||
      dto.hotelName !== undefined ||
      dto.hotelCheckIn !== undefined ||
      dto.hotelCheckOut !== undefined ||
      dto.hotelRoomType !== undefined ||
      dto.hotelGuests !== undefined ||
      dto.hotelNotes !== undefined;

    let normalizedTours = (existing.tours || []).map((tourItem) => ({
      tourId: tourItem.tourId,
      desiredDate: tourItem.desiredDate,
      adults: tourItem.adults,
      children: tourItem.children,
      carType: tourItem.carType,
      driverId: tourItem.driverId,
      guideId: tourItem.guideId,
    }));

    if (dto.tours !== undefined) {
      normalizedTours = this.toNormalizedTours(dto.tours);
    } else if (shouldReplaceTours) {
      normalizedTours = this.toNormalizedTours(undefined, {
        tourId: dto.tourId === undefined ? existing.tourId : dto.tourId,
        desiredDate:
          dto.desiredDate === undefined
            ? existing.desiredDate
              ? toDateOnly(existing.desiredDate)
              : null
            : dto.desiredDate,
        adults: dto.adults === undefined ? existing.adults : dto.adults,
        children: dto.children === undefined ? existing.children : dto.children,
      });
    } else if (normalizedTours.length === 0 && existing.tourId && existing.desiredDate) {
      normalizedTours = this.toNormalizedTours(undefined, {
        tourId: existing.tourId,
        desiredDate: toDateOnly(existing.desiredDate),
        adults: existing.adults,
        children: existing.children,
      });
    }

    if (dto.tourId === null) {
      normalizedTours = [];
    }

    for (const tourItem of normalizedTours) {
      await this.validateTourExists(tourItem.tourId);
      if (tourItem.driverId) {
        await this.validatePartnerAssignment(tourItem.driverId, PartnerType.DRIVER);
      }
      if (tourItem.guideId) {
        await this.validatePartnerAssignment(tourItem.guideId, PartnerType.GUIDE);
      }
    }

    let normalizedHotel: NormalizedHotelService | null = existing.hotelService
      ? {
          hotelId: existing.hotelService.hotelId,
          checkIn: existing.hotelService.checkIn,
          checkOut: existing.hotelService.checkOut,
          notes: existing.hotelService.notes,
          sendRequestToHotel: existing.hotelService.sendRequestToHotel,
          rooms:
            existing.hotelService.rooms.length > 0
              ? existing.hotelService.rooms.map((room) => ({
                  roomType: room.roomType,
                  guestCount: room.guestCount,
                }))
              : [{ roomType: 'Standard', guestCount: 1 }],
        }
      : null;
    let resolvedHotelName = existing.hotelName;
    let resolvedHotel: { id: string; name: string; email: string } | null =
      existing.hotelService?.hotel || null;

    if (dto.hotelService !== undefined) {
      if (dto.hotelService === null) {
        normalizedHotel = null;
        resolvedHotelName = null;
        resolvedHotel = null;
      } else {
        const normalizedHotelResult = this.toNormalizedHotelService(dto.hotelService);
        normalizedHotel = normalizedHotelResult.hotelService;
        if (normalizedHotel) {
          resolvedHotel = await this.findHotelOrThrow(normalizedHotel.hotelId);
          resolvedHotelName = resolvedHotel.name;
        }
      }
    } else if (shouldReplaceHotel) {
      const normalizedHotelResult = this.toNormalizedHotelService(undefined, {
        hotelName: dto.hotelName === undefined ? existing.hotelName : dto.hotelName,
        hotelCheckIn:
          dto.hotelCheckIn === undefined
            ? existing.hotelCheckIn
              ? toDateOnly(existing.hotelCheckIn)
              : null
            : dto.hotelCheckIn,
        hotelCheckOut:
          dto.hotelCheckOut === undefined
            ? existing.hotelCheckOut
              ? toDateOnly(existing.hotelCheckOut)
              : null
            : dto.hotelCheckOut,
        hotelRoomType: dto.hotelRoomType === undefined ? existing.hotelRoomType : dto.hotelRoomType,
        hotelGuests: dto.hotelGuests === undefined ? existing.hotelGuests : dto.hotelGuests,
        hotelNotes: dto.hotelNotes === undefined ? existing.hotelNotes : dto.hotelNotes,
      });
      normalizedHotel = normalizedHotelResult.hotelService;
      resolvedHotelName = normalizedHotelResult.fallbackHotelName;
      resolvedHotel = null;
    }

    const hasTour = normalizedTours.length > 0;
    const hasHotel = Boolean(normalizedHotel || resolvedHotelName);

    if (!hasTour && !hasHotel) {
      throw new BadRequestException('At least one service (tour or hotel) is required');
    }

    const legacyTour = this.getLegacySummaryFromTours(normalizedTours);
    const legacyHotel = this.getLegacySummaryFromHotel({
      hotelName: existing.hotelName,
      hotelCheckIn: existing.hotelCheckIn,
      hotelCheckOut: existing.hotelCheckOut,
      hotelNotes: existing.hotelNotes,
      hotelRoomType: existing.hotelRoomType,
      hotelGuests: existing.hotelGuests,
      normalizedHotel,
      resolvedHotelName,
    });

    const payment = this.resolvePaidAmounts({
      totalPrice: dto.totalPrice !== undefined ? safeAmount(dto.totalPrice) : safeAmount(existing.totalPrice),
      amountPaid: dto.amountPaid,
      amountPaidMode: dto.amountPaidMode,
      amountPaidPercent: dto.amountPaidPercent,
      fallback: {
        amountPaid: existing.amountPaid,
        amountPaidMode: existing.amountPaidMode,
        amountPaidPercent: existing.amountPaidPercent,
      },
    });

    if (payment.totalPrice < 0 || payment.amountPaid < 0) {
      throw new BadRequestException('Price values must be greater than or equal to 0');
    }

    const baseUpdateData: Prisma.BookingUncheckedUpdateInput = {
      userId: nextUserId ?? null,
      guestName: nextGuestName,
      guestEmail: nextGuestEmail,
      guestPhone: nextGuestPhone,
      tourId: hasTour ? legacyTour.tourId : null,
      desiredDate: hasTour ? legacyTour.desiredDate : null,
      adults: hasTour ? legacyTour.adults : null,
      children: hasTour ? legacyTour.children : null,
      roomType: hasTour ? (dto.roomType ?? existing.roomType ?? RoomType.double) : null,
      hotelName: hasHotel ? legacyHotel.hotelName : null,
      hotelCheckIn: hasHotel ? legacyHotel.hotelCheckIn : null,
      hotelCheckOut: hasHotel ? legacyHotel.hotelCheckOut : null,
      hotelRoomType: hasHotel ? legacyHotel.hotelRoomType : null,
      hotelGuests: hasHotel ? legacyHotel.hotelGuests : null,
      hotelNotes: hasHotel ? legacyHotel.hotelNotes : null,
      totalPrice: payment.totalPrice,
      amountPaid: payment.amountPaid,
      currency: dto.currency ?? existing.currency,
      amountPaidMode: payment.amountPaidMode,
      amountPaidPercent: payment.amountPaidPercent,
      status: dto.status ?? existing.status,
      serviceStatus: dto.serviceStatus ?? existing.serviceStatus,
      adminNote: dto.adminNote !== undefined ? normalizeNullableString(dto.adminNote) : existing.adminNote,
      note: dto.note !== undefined ? normalizeNullableString(dto.note) : existing.note,
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: baseUpdateData,
      });

      if (shouldReplaceTours) {
        await tx.bookingTour.deleteMany({ where: { bookingId: id } });

        if (normalizedTours.length > 0) {
          await tx.bookingTour.createMany({
            data: normalizedTours.map((tourItem) => ({
              bookingId: id,
              tourId: tourItem.tourId,
              desiredDate: tourItem.desiredDate,
              adults: tourItem.adults,
              children: tourItem.children,
              carType: tourItem.carType,
              driverId: tourItem.driverId,
              guideId: tourItem.guideId,
            })),
          });
        }
      }

      if (shouldReplaceHotel) {
        const existingHotelService = await tx.bookingHotelService.findUnique({
          where: { bookingId: id },
          select: { id: true },
        });

        if (normalizedHotel) {
          if (existingHotelService) {
            await tx.bookingHotelRoom.deleteMany({
              where: { hotelServiceId: existingHotelService.id },
            });

            await tx.bookingHotelService.update({
              where: { bookingId: id },
              data: {
                hotelId: normalizedHotel.hotelId,
                checkIn: normalizedHotel.checkIn,
                checkOut: normalizedHotel.checkOut,
                notes: normalizedHotel.notes,
                sendRequestToHotel: normalizedHotel.sendRequestToHotel,
              },
            });

            await tx.bookingHotelRoom.createMany({
              data: normalizedHotel.rooms.map((room) => ({
                hotelServiceId: existingHotelService.id,
                roomType: room.roomType,
                guestCount: room.guestCount,
              })),
            });
          } else {
            await tx.bookingHotelService.create({
              data: {
                bookingId: id,
                hotelId: normalizedHotel.hotelId,
                checkIn: normalizedHotel.checkIn,
                checkOut: normalizedHotel.checkOut,
                notes: normalizedHotel.notes,
                sendRequestToHotel: normalizedHotel.sendRequestToHotel,
                rooms: {
                  create: normalizedHotel.rooms.map((room) => ({
                    roomType: room.roomType,
                    guestCount: room.guestCount,
                  })),
                },
              },
            });
          }
        } else if (existingHotelService) {
          await tx.bookingHotelRoom.deleteMany({
            where: { hotelServiceId: existingHotelService.id },
          });
          await tx.bookingHotelService.delete({
            where: { bookingId: id },
          });
        }
      }
    });

    const updated = await this.findAdminBookingOrThrow(id);

    if (normalizedHotel?.sendRequestToHotel && resolvedHotel?.email) {
      await this.emailService.sendHotelInquiryEmail({
        recipientEmail: resolvedHotel.email,
        bookingId: updated.id,
        hotelName: resolvedHotel.name,
        guestName:
          updated.guestName ||
          (updated.user ? `${updated.user.firstName} ${updated.user.lastName}`.trim() : 'Guest customer'),
      });
    }

    return this.mapBooking(updated);
  }

  async deleteAdmin(id: string) {
    const existing = await this.findAdminBookingOrThrow(id);

    if (existing.isDeleted) {
      return {
        deleted: true,
        id,
      };
    }

    await this.prisma.booking.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return {
      deleted: true,
      id,
    };
  }

  async restoreAdmin(id: string) {
    const existing = await this.findAdminBookingOrThrow(id);

    if (!existing.isDeleted) {
      return {
        restored: true,
        id,
      };
    }

    await this.prisma.booking.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return {
      restored: true,
      id,
    };
  }

  async permanentDeleteAdmin(id: string) {
    await this.findAdminBookingOrThrow(id);

    await this.prisma.booking.delete({ where: { id } });

    return {
      permanentlyDeleted: true,
      id,
    };
  }
}
