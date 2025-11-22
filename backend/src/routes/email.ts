import { Router, Request, Response } from 'express';
import emailjs from '@emailjs/nodejs';
import { getMembers } from '../firestore';

const router = Router();

// POST /api/email/send-bulk
router.post('/send-bulk', async (req: Request, res: Response) => {
  try {
    const { subject, message, memberIds } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Get members data
    const allMembers = await getMembers();

    // Filter members if specific IDs provided, otherwise use all
    let targetMembers = allMembers;
    if (memberIds && Array.isArray(memberIds)) {
      targetMembers = allMembers.filter(member => memberIds.includes(member.id));
    }

    // Filter out members without email addresses
    const membersWithEmails = targetMembers.filter(member => member.email);

    if (membersWithEmails.length === 0) {
      return res.status(400).json({ error: 'No members with email addresses found' });
    }

    // Initialize EmailJS with private key
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;

    if (!privateKey || !serviceId || !templateId) {
      return res.status(500).json({ error: 'EmailJS configuration missing' });
    }

    emailjs.init({
      publicKey: privateKey, // For server-side, we use the private key as publicKey
      privateKey: privateKey,
    });

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send emails sequentially to avoid rate limits
    for (const member of membersWithEmails) {
      try {
        // Replace {{name}} placeholder with member's name
        const personalizedMessage = message.replace(/{{\s*name\s*}}/gi, member.name || '');

        const templateParams = {
          to_name: member.name,
          to_email: member.email,
          subject: subject,
          message: personalizedMessage,
        };

        await emailjs.send(serviceId, templateId, templateParams);
        success++;
      } catch (error) {
        console.error(`Failed to send email to ${member.email}:`, error);
        failed++;
        errors.push(`${member.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    res.json({
      success: true,
      sent: success,
      failed: failed,
      total: membersWithEmails.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({
      error: 'Failed to send bulk emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;