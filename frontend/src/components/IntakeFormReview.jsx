import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';

export default function IntakeFormReview({ branchId }) {
  const [loading, setLoading] = useState(false);
  const [intakeForms, setIntakeForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => {
    fetchIntakeForms();
  }, []);

  const fetchIntakeForms = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntakeForms(data);
    } catch (error) {
      toast.error('Error fetching intake forms');
      console.error('Error:', error);
    }
  };

  const sendPatientConfirmationEmail = async (email, data) => {
    try {
      const templateParams = {
        to_email: email,
        to_name: data.name,
        appointment_time: new Date(data.appointmentTime).toLocaleString(),
        subject: 'Welcome to CareSync - Patient Profile Created'
      };

      const response = await emailjs.send(
        'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        templateParams,
        'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
      );

      if (response.status === 200) {
        toast.success('Confirmation email sent successfully');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      toast.error('Failed to send confirmation email');
    }
  };

  const convertToPatient = async (formData) => {
    setLoading(true);
    try {
      // Create patient record
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .insert({
          email: formData.email,
          first_name: formData.fullName.split(' ')[0],
          last_name: formData.fullName.split(' ').slice(1).join(' '),
          phone: formData.phone || '',
          medical_history: {
            initial_reason: formData.reasonForVisit,
            conditions: [],
            allergies: [],
            medications: []
          }
        })
        .select()
        .single();

      if (patientError) throw patientError;

      // Associate patient with branch
      const { error: branchError } = await supabase
        .from('patient_branches')
        .insert({
          patient_id: patientData.id,
          branch_id: branchId
        });

      if (branchError) throw branchError;

      // Update form status
      const { error: updateError } = await supabase
        .from('forms')
        .update({ status: 'converted', patient_id: patientData.id })
        .eq('id', formData.id);

      if (updateError) throw updateError;

      // Create initial appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientData.id,
          branch_id: branchId,
          status: 'scheduled',
          start_time: formData.preferredTime,
          notes: formData.reasonForVisit
        });

      if (appointmentError) throw appointmentError;

      // Send confirmation email to patient
      await sendPatientConfirmationEmail(formData.email, {
        name: formData.fullName,
        appointmentTime: formData.preferredTime
      });

      toast.success('Successfully converted to patient record');
      fetchIntakeForms(); // Refresh the list
    } catch (error) {
      toast.error('Error converting intake form');
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setSelectedForm(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Review Intake Forms</h2>
      
      <div className="space-y-6">
        {intakeForms.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No pending intake forms</p>
        ) : (
          intakeForms.map((form) => (
            <div
              key={form.id}
              className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{form.fullName}</h3>
                  <p className="text-gray-600">{form.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Preferred Time: {new Date(form.preferredTime).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <h4 className="font-medium">Reason for Visit:</h4>
                    <p className="text-gray-700">{form.reasonForVisit}</p>
                  </div>
                  {form.phone && (
                    <p className="text-gray-600 mt-1">Phone: {form.phone}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => convertToPatient(form)}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Converting...' : 'Convert to Patient'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 