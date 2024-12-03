import Layout from '../components/Layout'

export default function PrivacyPolicy() {
  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
      <p className="mb-4">
        This privacy policy outlines how we collect, use, and protect your personal information.
      </p>
      <h3 className="text-lg font-semibold mb-2">Data Collection</h3>
      <p className="mb-4">
        We use Google Analytics to track user interactions with our website. This helps us understand how users engage with our content and improve our services.
      </p>
      <h3 className="text-lg font-semibold mb-2">Data Usage</h3>
      <p className="mb-4">
        The data collected through Google Analytics is used solely for the purpose of improving our website and services. We do not sell or share this data with third parties.
      </p>
      <h3 className="text-lg font-semibold mb-2">Your Rights</h3>
      <p>
        You have the right to request access to your personal data, to request correction of the data, to request that we restrict our processing, or to request that we delete your data.
      </p>
    </Layout>
  )
}

