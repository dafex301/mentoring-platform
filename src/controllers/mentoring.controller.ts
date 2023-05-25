import { AuthenticatedRequest } from "../typings/request.type";
import { Response } from "express";
import mentoringService from "../services/mentoring.service";

export const createMentoring = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { mentees_id, start_time, end_time } = req.body;
  const mentor_id = req.userId;

  try {
    const mentoring = await mentoringService.createMentoring(
      Number(mentor_id),
      mentees_id as number[],
      start_time,
      end_time
    );

    return res.status(200).json({
      message: "Mentoring created successfully",
      data: mentoring,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const createMentoringFeedback = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const mentee_id = req.userId;
    const { mentoring_id, feedback, rating } = req.body;

    const mentoringFeedback = await mentoringService.createMentoringFeedback(
      Number(mentee_id),
      mentoring_id,
      feedback,
      rating
    );

    return res.status(200).json({
      message: "Mentoring feedback created successfully",
      data: mentoringFeedback,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getMentoringsSchedule = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user_id = req.userId;
    const role = req.role;
    const { from_date } = req.query;

    const mentorings = await mentoringService.getMentoringsSchedule(
      Number(user_id),
      role!,
      from_date as string
    );

    return res.status(200).json({
      message: "Mentorings retrieved successfully",
      data: mentorings,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
