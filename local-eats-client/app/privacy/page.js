export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-gray-600">
          <p className="mb-4">Last updated: May 2026</p>
          <p className="mb-6">
            Welcome to LocalEats Kahalgaon. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. The Data We Collect</h2>
          <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes delivery address, email address and telephone numbers.</li>
            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of orders you have placed with us.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. How We Use Your Data</h2>
          <p className="mb-6">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to perform the contract 
            we are about to enter into or have entered into with you (such as processing your food order).
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Data Security</h2>
          <p className="mb-6">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.
          </p>

          <p className="mt-12 text-sm text-gray-400">If you have any questions about this privacy policy, please contact us at support@localeatskahalgaon.com.</p>
        </div>
      </div>
    </div>
  );
}
