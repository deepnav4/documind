import type {Metadata} from "next";
import {LegalShell} from "@/components/legal/legal-shell";
import {Navbar} from "@/components/navbar/nav";
import {auth} from "@/utils/auth";

export const metadata: Metadata = {
  title: "Privacy Policy — DocuMind",
  description:
    "How DocuMind collects, uses, and protects your data when you turn PDFs into study guides.",
};

export default async function PrivacyPage() {
  const user = await auth();
  return (
    <>
      <Navbar user={user} />
      <LegalShell title="Privacy Policy" lastUpdated="July 2, 2026">
      <section>
        <p>
          This Privacy Policy explains what information DocuMind
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects when you use our platform
          to turn documents into study material, how we use it, and the choices
          you have. By using DocuMind, you agree to the practices described here.
        </p>
      </section>

      <section>
        <h2>1. Information We Collect</h2>
        <ul>
          <li>
            <strong>Account information.</strong> When you sign in with Google,
            we receive your name, email address, and profile image to create and
            secure your account.
          </li>
          <li>
            <strong>Uploaded documents.</strong> The PDFs and files you upload,
            along with the text and content extracted from them in order to
            generate study material.
          </li>
          <li>
            <strong>Generated content.</strong> The summaries, flashcards,
            quizzes, mind maps, embeddings, and chat conversations produced from
            your documents, which we store so you can revisit them.
          </li>
          <li>
            <strong>Usage &amp; technical data.</strong> Basic session and device
            information needed to operate the service and keep it secure.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>
            To process your documents and generate summaries, flashcards,
            quizzes, mind maps, and chat answers.
          </li>
          <li>To power semantic search across your uploaded content.</li>
          <li>To save your workspace so you can return to your materials.</li>
          <li>To maintain, secure, and improve the service.</li>
        </ul>
      </section>

      <section>
        <h2>3. Third-Party Processors</h2>
        <p>
          We rely on trusted service providers to deliver core functionality.
          Data is shared with them only as needed to provide the service:
        </p>
        <ul>
          <li>
            <strong>Google</strong> — authentication (sign-in).
          </li>
          <li>
            <strong>UploadThing</strong> — secure file upload and storage for
            your documents.
          </li>
          <li>
            <strong>OpenAI</strong> — AI processing for content generation,
            embeddings, and chat.
          </li>
          <li>
            <strong>Hosting &amp; database providers</strong> — to run the
            application and store your data securely.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Data Retention</h2>
        <p>
          We keep your uploaded documents and generated study material for as
          long as your account is active so you can continue to use them. You can
          delete your content at any time, and you may request deletion of your
          account and associated data.
        </p>
      </section>

      <section>
        <h2>5. Your Rights &amp; Choices</h2>
        <ul>
          <li>Access and review the documents and materials in your account.</li>
          <li>Delete your uploaded documents and generated content.</li>
          <li>
            Request deletion of your account and associated data by contacting
            us.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Data Security</h2>
        <p>
          We use reasonable technical and organizational measures to protect your
          information. No method of transmission or storage is completely secure,
          but we work to safeguard your data against unauthorized access.
        </p>
      </section>

      <section>
        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes
          will be reflected by updating the &ldquo;Last updated&rdquo; date at the
          top of this page.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          Your privacy matters to us. For any privacy question or data request —
          including deleting your account and data — you can email the founder of
          DocuMind directly at{" "}
          <a href="mailto:support@documind.fun">
            support@documind.fun
          </a>
          . Every message is read and answered personally.
        </p>
      </section>
      </LegalShell>
    </>
  );
}
