export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Terms & Conditions</h1>
        <div className="prose prose-lg text-gray-600">
          <p className="mb-4">Last updated: May 2026</p>
          <p className="mb-6">
            Please read these Terms and Conditions carefully before using the LocalEats Kahalgaon platform. 
            By accessing or using our service, you agree to be bound by these terms.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6">
            By creating an account, placing an order, or browsing the LocalEats website, you accept and agree to be bound by these terms. 
            If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Zero Commission Model</h2>
          <p className="mb-6">
            LocalEats operates on a zero-commission model for restaurant partners. This means we do not take a percentage of the restaurant's food sales. 
            Restaurants pay a fixed monthly subscription, ensuring prices remain fair for customers.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Ordering and Delivery</h2>
          <p className="mb-6">
            Delivery times are estimates and may vary based on restaurant preparation time and traffic conditions. 
            LocalEats charges a nominal delivery fee (₹10-30) which goes directly towards compensating our delivery partners.
          </p>

          <p className="mt-12 text-sm text-gray-400">If you have any questions about these terms, please contact us at support@localeatskahalgaon.com.</p>
        </div>
      </div>
    </div>
  );
}
