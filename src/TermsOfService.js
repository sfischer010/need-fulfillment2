import React from "react";

function TermsOfService() {
  return (
    <div className="terms-container p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-6">Effective Date: April 08, 2025</p>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">1. Purpose</h2>
        <p>
          Need Fulfillment is a platform that connects users with others in
          their community to fulfill needs such as donations, resources, or
          services. The platform facilitates communication and connections but
          does not take responsibility for the actual exchange or interactions
          between users.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">2. Eligibility</h2>
          To use Need Fulfillment, you must:
          <ul className="list-disc ml-6">
            <li>Be at least 18 years old.</li>
            <li>Agree to provide accurate and truthful information during registration.</li>
            <li>
              Not have been convicted of violent crimes, sexual crimes, or other serious
              offenses. Need Fulfillment reserves the right to remove or deny accounts based
              on this policy.
            </li>
          </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">3. Code of Conduct</h2>
          When using Need Fulfillment, you agree to:
          <ul className="list-disc ml-6">
            <li>Treat other users with respect and kindness.</li>
            <li>Fulfill commitments made to other users.</li>
            <li>Avoid fraudulent or deceptive behavior.</li>
            <li>
              Refrain from harassment, discrimination, or harmful language or actions.
            </li>
            <li>Not use the platform for illegal activities or unauthorized solicitation.</li>
          </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">4. Background Checks and Self-Declaration</h2>
        <p>
          Need Fulfillment does not perform automatic background checks. By
          registering, you confirm that you are not prohibited from
          participating based on prior convictions of violent or sexual crimes.
        </p>
        <p>
          You may be required to provide additional information or verification during
          registration or at the platform's discretion.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">5. User Responsibilities</h2>
        <ul className="list-disc ml-6">
            <li>Users are solely responsible for the accuracy of the information they provide.</li>
            <li>Users engage with others at their own risk.</li>
            <li>
              Users are responsible for complying with local laws regarding donations,
              services, and other transactions.
            </li>
          </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">6. Content and Intellectual Property</h2>
          <ul className="list-disc ml-6">
            <li>Users retain ownership of the content they upload to the platform.</li>
            <li>
              By uploading content, you grant Need Fulfillment a non-exclusive,
              royalty-free license to display and use the content for platform operations.
            </li>
            <li>
              You may not copy, distribute, or use content from the platform without
              permission.
            </li>
          </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">7. Privacy</h2>
        <p>
          Your privacy is important to us. Please refer to our Privacy Policy for information
          on how we handle your data.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">8. Disclaimer of Warranties</h2>
        <p>
          Need Fulfillment is provided "as-is" without warranties of any kind, express or
          implied. We make no guarantees regarding the availability or reliability of the
          platform.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">9. Limitation of Liability</h2>
        <p>
          Need Fulfillment is not liable for any direct, indirect, or incidental damages
          arising out of your use of the platform, including interactions with other users.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">10. Account Termination</h2>
        <p>
          Need Fulfillment reserves the right to suspend or terminate accounts at its sole
          discretion, especially in cases of violations of these Terms of Service.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">11. Changes to the Terms</h2>
        <p>
          Need Fulfillment may update these Terms of Service at any time. Continued use of
          the platform constitutes acceptance of the revised terms.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold mb-2">12. Governing Law</h2>
        <p>
          These Terms of Service are governed by the laws of [Insert Jurisdiction].
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-2">13. Contact Us</h2>
        <p>
          For questions or concerns, contact us at:
          <br />
          Email: support@needfulfillment.org
        </p>
      </section>
    </div>
  );
}

export default TermsOfService;