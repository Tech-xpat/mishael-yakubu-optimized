import { Resend } from 'resend';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { firestore } from './firebase';

// Initialize Resend - store API key in environment variable
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.warn('VITE_RESEND_API_KEY is not set. Email service will not work.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Email templates
export const emailTemplates = {
  welcome: (name: string, portfolioUrl: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
        .content { padding: 30px; background: #f9f9f9; border-radius: 8px; margin: 20px 0; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Empire Digital Worldwide!</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for subscribing! We're excited to share our latest projects, insights, and creative work with you.</p>
            <p>We specialize in:</p>
            <ul>
                <li>Web Development</li>
                <li>Brand Design</li>
                <li>AI Automation</li>
            </ul>
            <p>Check out our latest work:</p>
            <a href="${portfolioUrl}" class="button">View Our Portfolio</a>
            <p>Stay tuned for updates on our newest projects and services!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Empire Digital Worldwide. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `,
  
  projectAnnouncement: (projectName: string, category: string, portfolioUrl: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
        .content { padding: 30px; background: #f9f9f9; border-radius: 8px; margin: 20px 0; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Project Launch! 🎉</h1>
        </div>
        <div class="content">
            <h2>Check Out Our Latest ${category} Work</h2>
            <p>We've just completed an amazing new project: <strong>${projectName}</strong></p>
            <p>This project showcases our expertise in ${category} and demonstrates our commitment to delivering exceptional results.</p>
            <a href="${portfolioUrl}" class="button">View Project</a>
            <p>We love sharing our latest work. Follow us for more updates!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Empire Digital Worldwide. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `,

  newsletter: (subject: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
        .content { padding: 30px; background: #f9f9f9; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${subject}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; 2025 Empire Digital Worldwide. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `
};

// Add subscriber to Firestore and send welcome email
export const addSubscriber = async (email: string, name?: string) => {
  try {
    if (!resend) {
      console.warn('Resend service not configured');
    }

    // Check if email already exists
    const q = query(collection(firestore, 'subscribers'), where('email', '==', email));
    const existingDocs = await getDocs(q);
    
    if (!existingDocs.empty) {
      return { success: false, message: 'Email already subscribed' };
    }

    // Add to Firestore
    const docRef = await addDoc(collection(firestore, 'subscribers'), {
      email,
      name: name || 'Subscriber',
      subscribedAt: new Date(),
      status: 'active',
      receivedWelcome: false,
      lastEmailSent: null
    });

    // Send welcome email via Resend if configured
    if (resend) {
      try {
        const portfolioUrl = window.location.origin;
        await resend.emails.send({
          from: 'noreply@empiredigitalsworldwide.com',
          to: email,
          subject: 'Welcome to Empire Digital Worldwide!',
          html: emailTemplates.welcome(name || 'Subscriber', portfolioUrl)
        });

        // Mark welcome email as sent
        await updateDoc(doc(firestore, 'subscribers', docRef.id), {
          receivedWelcome: true,
          lastEmailSent: new Date()
        });
      } catch (emailError) {
        console.error('Email send error:', emailError);
        // Still keep subscriber even if email fails
        console.warn('Subscriber added but welcome email could not be sent');
      }
    }

    return { success: true, message: 'Successfully subscribed!' };
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return { success: false, message: 'Error subscribing. Please try again.' };
  }
};

// Get all subscribers
export const getSubscribers = async () => {
  try {
    const q = query(collection(firestore, 'subscribers'), where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      email: doc.data().email,
      name: doc.data().name,
      subscribedAt: doc.data().subscribedAt,
      status: doc.data().status,
      receivedWelcome: doc.data().receivedWelcome,
      lastEmailSent: doc.data().lastEmailSent
    }));
  } catch (error) {
    console.error('Error getting subscribers:', error);
    return [];
  }
};

// Send project announcement to all subscribers
export const sendProjectAnnouncement = async (
  projectName: string,
  category: string
) => {
  try {
    if (!resend) {
      return { success: false, message: 'Email service not configured' };
    }

    const subscribers = await getSubscribers();

    if (subscribers.length === 0) {
      return { success: false, message: 'No subscribers to send to' };
    }

    const portfolioUrl = window.location.origin;
    const emailHtml = emailTemplates.projectAnnouncement(projectName, category, portfolioUrl);
    
    // Send to all subscribers with error tracking
    const batch = writeBatch(firestore);
    let successCount = 0;
    let errorCount = 0;
    
    for (const subscriber of subscribers) {
      if (subscriber.email) {
        try {
          await resend.emails.send({
            from: 'noreply@empiredigitalsworldwide.com',
            to: subscriber.email,
            subject: `New ${category} Project: ${projectName}`,
            html: emailHtml
          });
          successCount++;

          // Update last email sent timestamp
          const q = query(collection(firestore, 'subscribers'), where('email', '==', subscriber.email));
          const docs = await getDocs(q);
          docs.forEach(docSnap => {
            batch.update(docSnap.ref, { lastEmailSent: new Date() });
          });
        } catch (emailError) {
          console.error(`Failed to send to ${subscriber.email}:`, emailError);
          errorCount++;
        }
      }
    }

    await batch.commit();
    const message = `Announcement sent to ${successCount} of ${subscribers.length} subscribers${errorCount > 0 ? ` (${errorCount} failed)` : ''}`;
    return { success: true, message };
  } catch (error) {
    console.error('Error sending announcement:', error);
    return { success: false, message: 'Error sending emails' };
  }
};

// Send newsletter to all subscribers
export const sendNewsletter = async (subject: string, content: string) => {
  try {
    if (!resend) {
      return { success: false, message: 'Email service not configured' };
    }

    const subscribers = await getSubscribers();

    if (subscribers.length === 0) {
      return { success: false, message: 'No subscribers to send to' };
    }

    const emailHtml = emailTemplates.newsletter(subject, content);
    
    let successCount = 0;
    let errorCount = 0;
    const batch = writeBatch(firestore);

    for (const subscriber of subscribers) {
      if (subscriber.email) {
        try {
          await resend.emails.send({
            from: 'noreply@empiredigitalsworldwide.com',
            to: subscriber.email,
            subject,
            html: emailHtml
          });
          successCount++;
          batch.update(doc(firestore, 'subscribers', subscriber.id), {
            lastEmailSent: new Date()
          });
        } catch (emailError) {
          console.error(`Failed to send to ${subscriber.email}:`, emailError);
          errorCount++;
        }
      }
    }
    
    await batch.commit();
    const message = `Newsletter sent to ${successCount} of ${subscribers.length} subscribers${errorCount > 0 ? ` (${errorCount} failed)` : ''}`;
    return { success: true, message };
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return { success: false, message: 'Error sending newsletter' };
  }
};

// Unsubscribe email
export const unsubscribeEmail = async (email: string) => {
  try {
    const q = query(collection(firestore, 'subscribers'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, message: 'Email not found' };
    }

    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, { status: 'unsubscribed' });
    });

    return { success: true, message: 'Successfully unsubscribed' };
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return { success: false, message: 'Error unsubscribing' };
  }
};

// Delete subscriber
export const deleteSubscriber = async (email: string) => {
  try {
    const q = query(collection(firestore, 'subscribers'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    return { success: true, message: 'Subscriber deleted' };
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return { success: false, message: 'Error deleting subscriber' };
  }
};
