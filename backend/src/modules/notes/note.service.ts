import { Readable } from 'stream';
import { Note } from './note.model';
import { noteRepository } from './note.repository';
import { Batch } from '../batches/batch.model';
import { cloudinary } from '../../config/cloudinary';
import { env } from '../../config/env';
import { paginate } from '../../utils/pagination';
import { NotFoundError } from '../../utils/errors';
import { PaginationQuery } from '../../types';

export const noteService = {
  upload: async (
    data: { title: string; description: string; subject: string; batchId: string },
    file: Express.Multer.File,
    uploadedBy: string
  ) => {
    const batch = await Batch.findById(data.batchId);
    if (!batch) throw new NotFoundError('Batch');

    let secureUrl = '';

    if (env.CLOUDINARY_CLOUD_NAME === 'dev-cloud') {
      // Mock upload for testing/development environments without active Cloudinary credentials
      secureUrl = `https://res.cloudinary.com/dev-cloud/raw/upload/v1234567890/mock-note-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    } else {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'coaching-erp/notes',
            resource_type: 'auto',
            public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          },
          (error, result) => {
            if (error || !result) reject(error || new Error('Upload failed'));
            else resolve(result);
          }
        );
        Readable.from(file.buffer).pipe(stream);
      });
      secureUrl = uploadResult.secure_url;
    }

    return noteRepository.create({
      title: data.title,
      description: data.description,
      subject: data.subject,
      batchId: data.batchId as never,
      fileUrl: secureUrl,
      fileName: file.originalname,
      fileType: file.mimetype,
      uploadedBy: uploadedBy as never,
      uploadedAt: new Date(),
    });
  },

  getAll: async (query: PaginationQuery, batchId?: string, subject?: string) => {
    const filter: Record<string, unknown> = {};
    if (batchId) filter.batchId = batchId;
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    return paginate(Note, filter, query, ['title', 'subject', 'description'], ['batchId', 'uploadedBy']);
  },

  getById: async (id: string) => {
    const note = await noteRepository.findById(id);
    if (!note) throw new NotFoundError('Note');
    return note;
  },

  delete: async (id: string) => {
    const note = await noteRepository.delete(id);
    if (!note) throw new NotFoundError('Note');

    if (env.CLOUDINARY_CLOUD_NAME !== 'dev-cloud') {
      const publicId = note.fileUrl.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' }).catch(() => {});
    }

    return note;
  },
};
