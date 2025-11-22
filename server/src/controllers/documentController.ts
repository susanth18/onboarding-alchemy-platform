
import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';
import path from 'path';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  const { employeeId, type } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  if (!employeeId) return res.status(400).json({ error: 'Missing employeeId' });

  try {
    const document = await prisma.document.create({
      data: {
        employeeId,
        type,
        filename: file.originalname,
        path: file.filename // Store the generated filename
      }
    });

    // Also update the legacy URL fields on Employee if applicable, for backward compatibility
    let updateData: any = {};
    if (type === 'job_description') updateData.jobDescriptionUrl = `/api/documents/${document.id}/download`;
    if (type === 'contract') updateData.contractUrl = `/api/documents/${document.id}/download`;
    if (type === 'resume') updateData.resumeUrl = `/api/documents/${document.id}/download`;

    if (Object.keys(updateData).length > 0) {
        await prisma.employee.update({
            where: { id: employeeId },
            data: updateData
        });
    }

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading document' });
  }
};

export const downloadDocument = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const document = await prisma.document.findUnique({
            where: { id: Number(id) }
        });

        if (!document) return res.status(404).json({ error: 'Document not found' });

        const filePath = path.join(__dirname, '../../uploads', document.path);
        res.download(filePath, document.filename);
    } catch (error) {
        res.status(500).json({ error: 'Error downloading document' });
    }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
    const { employeeId } = req.query;
    try {
        const documents = await prisma.document.findMany({
            where: { employeeId: String(employeeId) },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
};
