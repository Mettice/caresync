import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, data } = await req.json()
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to CareSync</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(to right, #4F46E5, #3B82F6);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #ffffff;
              padding: 20px;
              border: 1px solid #e5e7eb;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4F46E5;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 0.875rem;
              color: #6B7280;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to CareSync</h1>
          </div>
          <div class="content">
            <p>Dear ${data.name},</p>
            
            <p>Thank you for choosing CareSync for your healthcare needs. We're delighted to confirm that your patient profile has been created successfully.</p>
            
            <h2>Your Appointment Details:</h2>
            <p>Date and Time: ${new Date(data.appointmentTime).toLocaleString()}</p>
            
            <h2>Next Steps:</h2>
            <ul>
              <li>Please arrive 15 minutes before your scheduled appointment</li>
              <li>Bring any relevant medical records or test results</li>
              <li>Have your ID and insurance information ready</li>
            </ul>
            
            <p>You can access your patient portal to:</p>
            <ul>
              <li>View and manage your appointments</li>
              <li>Update your medical information</li>
              <li>Communicate with your healthcare team</li>
              <li>Access your medical records</li>
            </ul>
            
            <a href="https://caresync.com/patient-portal" class="button">
              Access Patient Portal
            </a>
            
            <p>If you need to reschedule or have any questions, please don't hesitate to contact us:</p>
            <ul>
              <li>Phone: (555) 123-4567</li>
              <li>Email: support@caresync.com</li>
            </ul>
            
            <p>We look forward to providing you with excellent care!</p>
            
            <p>Best regards,<br>The CareSync Team</p>
          </div>
          <div class="footer">
            <p>This email was sent by CareSync Medical Center</p>
            <p>123 Healthcare Ave, Medical City, MC 12345</p>
          </div>
        </body>
      </html>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'CareSync <noreply@caresync.com>',
        to: email,
        subject: 'Welcome to CareSync - Patient Profile Created',
        html: emailContent,
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to send email')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 