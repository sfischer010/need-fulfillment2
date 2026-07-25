import React, { useState } from 'react';

function FeedbackForm() {
  
  // Build feedback form here...
  // NEEDS: The feedback form should be a space where users can submit feedback about the Need Fulfillment application. It should include a text area for the feedback message, a checkbox indicating whether the user is an organization, and a submit button. If the user checks the organization box, an additional input field should appear for the organization name.
  // The form should be styled with Tailwind CSS classes for a clean and modern look.
  // Use React state to manage the form inputs and submission status.
  // The form should handle submission by calling a backend endpoint, and display a thank you message upon successful submission.
  // Use state to manage form inputs and submission status.
  const [message, setMessage] = useState('');
  const [isOrganization, setIsOrganization] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const feedbackData = {
      message,
      isOrganization,
    };
    console.log('Feedback submitted:', feedbackData);
    setSubmitted(true);
    // You can plug this into an API call here
  };

  return (
    <div id="post-need" className="form-container p-6 space-y-6 text-cyan-950">
      <h2 className="text-2xl font-bold">Share Your Feedback</h2>
      {submitted ? (
        <p className="text-green-600 font-bold">Thank you for your input!</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block font-medium">Feedback</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOrganization"
              checked={isOrganization}
              onChange={() => setIsOrganization(!isOrganization)}
              className="mr-2"
            />
            <label htmlFor="isOrganization">I’m submitting on behalf of an organization</label>
          </div>
          {isOrganization && (
            <div className="flex items-center">
              <label htmlFor="orgName" className="mr-2">Organization Name:</label>
              <input type="text" id="orgName" name="orgName" />
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send Feedback
          </button>
        </form>
      )}
    </div>
  );
}

export default FeedbackForm;
