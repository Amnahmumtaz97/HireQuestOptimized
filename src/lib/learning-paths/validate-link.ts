import { Types } from 'mongoose'
import { StageModel, type IStage } from '@/models/Stage'
import { UserPathProgressModel } from '@/models/UserPathProgress'

export type PathLinkValidation =
  | { ok: true; stage: IStage & { _id: Types.ObjectId } }
  | { ok: false; status: number; message: string }

/**
 * Ensure path/stage ids are valid, stage belongs to path, user is enrolled,
 * and (optionally) the stage is the current unlocked stage.
 */
export async function validatePathStageLinkage(input: {
  userId: string
  learningPathId: string
  learningStageId: string
  /** When true, stage must be current (or already completed). */
  requireCurrentStage?: boolean
}): Promise<PathLinkValidation> {
  const { userId, learningPathId, learningStageId, requireCurrentStage = true } = input

  if (!Types.ObjectId.isValid(learningPathId) || !Types.ObjectId.isValid(learningStageId)) {
    return { ok: false, status: 400, message: 'Invalid learning path or stage id' }
  }

  const stage = await StageModel.findOne({
    _id: learningStageId,
    pathId: learningPathId,
  }).lean()
  if (!stage) {
    return { ok: false, status: 400, message: 'Stage does not belong to the given path' }
  }

  const progress = await UserPathProgressModel.findOne({
    userId,
    pathId: learningPathId,
  }).lean()
  if (!progress) {
    return {
      ok: false,
      status: 400,
      message: 'Enroll in this learning path before linking an interview to it',
    }
  }

  if (requireCurrentStage) {
    const completed = new Set((progress.completedStageIds || []).map(String))
    if (completed.has(learningStageId)) {
      // Re-practice of a completed stage is allowed for interviews.
      return { ok: true, stage: stage as IStage & { _id: Types.ObjectId } }
    }

    let currentId = progress.currentStageId ? String(progress.currentStageId) : null
    if (!currentId) {
      const ordered = await StageModel.find({ pathId: learningPathId }).sort({ order: 1 }).lean()
      const next = ordered.find((s) => !completed.has(String(s._id)))
      currentId = next ? String(next._id) : null
    }

    if (!currentId) {
      return {
        ok: false,
        status: 400,
        message: 'This learning path has no open stage to link',
      }
    }
    if (currentId !== learningStageId) {
      return {
        ok: false,
        status: 400,
        message: 'Complete the current path stage before starting a later stage interview',
      }
    }
  }

  return { ok: true, stage: stage as IStage & { _id: Types.ObjectId } }
}
