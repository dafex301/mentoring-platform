import { MentoringScheduleByMentee } from "../typings/mentoring.type";
import { Repository } from "./index.repository";

export default class MentoringAttendeeRepository extends Repository {
  async createMentoringAttendee(mentoring_id: number, mentee_id: number) {
    const mentoringAttendee = await this.prisma.mentoring_Attendee.create({
      data: {
        mentoring_id,
        mentee_id,
      },
    });
    return mentoringAttendee;
  }

  async getMentoringAttendeeByMenteeIdAndMentoringId(
    mentee_id: number,
    mentoring_id: number
  ) {
    const mentoringAttendee = await this.prisma.mentoring_Attendee.findUnique({
      where: {
        mentoring_id_mentee_id: {
          mentoring_id,
          mentee_id,
        },
      },
    });
    return mentoringAttendee;
  }

  async createMentoringFeedback(
    mentoring_id: number,
    mentee_id: number,
    feedback: string,
    rating: number
  ) {
    const mentoringFeedback = await this.prisma.mentoring_Attendee.update({
      where: {
        mentoring_id_mentee_id: {
          mentoring_id,
          mentee_id,
        },
      },
      data: {
        feedback,
        rating,
      },
    });

    return mentoringFeedback;
  }

  async getMentoringByMenteeId(mentee_id: number) {
    const mentoring: MentoringScheduleByMentee[] = await this.prisma.mentoring_Attendee.findMany({
      where: {
        mentee_id,
      },
      include: {
        Mentoring: {
          select: {
            start_time: true,
            end_time: true,
            Mentor: {
              select: {
                User: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  
    const formattedMentoring = mentoring.map((data) => ({
      name: data.Mentoring.Mentor.User.name,
      start_time: data.Mentoring.start_time,
      end_time: data.Mentoring.end_time,
    }));
  
    return formattedMentoring;
  }
  

  async getFilteredMentoringByMenteeIdAndFromDate(
    mentee_id: number,
    from_date: string
  ) {
    const mentoring: MentoringScheduleByMentee[] = await this.prisma.mentoring_Attendee.findMany({
      where: {
        mentee_id,
        Mentoring: {
          start_time: {
            gte: new Date(from_date),
          },
        },
      },

      include: {
        Mentoring: {
          include: {
            Mentor: {
              include: {
                User: true,
              },
            },
          },
        },
      },
    });

    const formattedMentoring = mentoring.map((data) => ({
      name: data.Mentoring.Mentor.User.name,
      start_time: data.Mentoring.start_time,
      end_time: data.Mentoring.end_time,
    }));
  
    return formattedMentoring;
  }
}
