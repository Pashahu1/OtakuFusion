function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col items-center justify-start gap-[20px] min-h-screen bg-[#111111] pt-[100px] px-4 md:px-0">
      <h1 className="text-5xl font-extrabold text-center text-white mb-8">
        Privacy Policy
      </h1>

      <div className="bg-[#1a1a1a] rounded-xl shadow-lg p-8 max-w-3xl text-white flex flex-col gap-6">
        <p className="text-lg leading-relaxed">
          <span className="font-semibold">Effective Date:</span> August 2025
        </p>

        <p className="text-lg leading-relaxed">
          At <span className="font-semibold">OtakuFusion</span>, your privacy is
          important to us. This Privacy Policy explains how we collect, use, and
          protect your information when you visit our website.
        </p>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">1. Information We Collect</h2>
          <p className="text-lg leading-relaxed">
            OtakuFusion does not require registration or personal information to
            watch anime. The only data we may collect includes:
          </p>
          <ul className="list-disc list-inside text-lg flex flex-col gap-2">
            <li>
              Anonymous analytics data (e.g., pages visited, device type,
              browser type) to improve our site.
            </li>
            <li>
              Cookies or similar technologies for basic site functionality.
            </li>
          </ul>

          <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
          <p className="text-lg leading-relaxed">
            We use the information we collect for purposes such as:
          </p>
          <ul className="list-disc list-inside text-lg flex flex-col gap-2">
            <li>Improving site performance and user experience.</li>
            <li>Monitoring and preventing misuse or technical issues.</li>
            <li>Delivering relevant content and updates.</li>
          </ul>

          <h2 className="text-2xl font-bold">3. Third-Party Services</h2>
          <p className="text-lg leading-relaxed">
            Our site may use minimal ads or analytics services. We ensure that
            any third-party service we use complies with privacy standards.
          </p>

          <h2 className="text-2xl font-bold">4. Cookies</h2>
          <p className="text-lg leading-relaxed">
            OtakuFusion uses cookies only for basic site functionality and
            analytics. You can disable cookies in your browser, but some site
            features may not work correctly.
          </p>

          <h2 className="text-2xl font-bold">5. Data Security</h2>
          <p className="text-lg leading-relaxed">
            We take reasonable measures to protect your data and ensure our site
            is safe from malicious activity. However, no method of internet
            transmission is completely secure, so we cannot guarantee absolute
            security.
          </p>

          <h2 className="text-2xl font-bold">6. Third-Party Links</h2>
          <p className="text-lg leading-relaxed">
            Our site may contain links to other websites. We are not responsible
            for the privacy practices of these third-party sites.
          </p>

          <h2 className="text-2xl font-bold">7. Children’s Privacy</h2>
          <p className="text-lg leading-relaxed">
            OtakuFusion is not directed to children under 13. We do not
            knowingly collect personal information from children.
          </p>

          <h2 className="text-2xl font-bold">8. Changes to This Policy</h2>
          <p className="text-lg leading-relaxed">
            We may update this Privacy Policy from time to time. The “Effective
            Date” will indicate the latest update.
          </p>

          <h2 className="text-2xl font-bold">9. Contact Us</h2>
          <p className="text-lg leading-relaxed">
            If you have any questions about this Privacy Policy, please contact
            us at:
            <span className="font-semibold text-[#f0c040]">
              {' '}
              maks.chudin567@gmail.com
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
