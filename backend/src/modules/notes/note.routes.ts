import { Router } from 'express';
import { noteController } from './note.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import { auditLog } from '../../middleware/auditLog';
import { createNoteSchema, noteIdParamSchema } from './note.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('admin', 'teacher'),
  upload.single('file'),
  validate(createNoteSchema),
  auditLog('UPLOAD_NOTE'),
  noteController.upload
);

router.get('/', authorize('admin', 'teacher', 'student'), noteController.getAll);
router.get('/:id', authorize('admin', 'teacher', 'student'), validate(noteIdParamSchema), noteController.getById);
router.delete('/:id', authorize('admin', 'teacher'), validate(noteIdParamSchema), auditLog('DELETE_NOTE'), noteController.delete);

export default router;
