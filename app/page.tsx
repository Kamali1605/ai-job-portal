import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-white">

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-200" />

        <div className="relative max-w-7xl mx-auto px-8 py-32 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          {/* LEFT */}
          <div>
            <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold rounded-full bg-black text-white">
              AI Powered Recruitment
            </span>

            <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
              Smarter Hiring <br /> Starts Here
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-xl">
              Resume Analyzer helps candidates get discovered faster
              and recruiters hire smarter using AI-driven insights.
            </p>

            <div className="mt-10 flex gap-6">
              <Link
                href="/register"
                className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Get Started
              </Link>

              <Link
                href="/login"
                className="border border-gray-400 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Login
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white border rounded-2xl shadow-xl p-10 space-y-6">
            <Feature title="AI Resume Analysis">
              Automatically evaluate resumes with skill matching.
            </Feature>
            <Feature title="Role-Based Dashboards">
              Separate dashboards for candidates and recruiters.
            </Feature>
            <Feature title="Smart Hiring Workflow">
              Reduce manual screening and speed up hiring.
            </Feature>
          </div>
        </div>
      </section>

      {/* TRUST / VALUE */}
      <section className="border-t">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Built for Modern Hiring
          </h2>

          <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
            Designed to simplify recruitment for both job seekers
            and hiring teams.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
            <ValueCard
              title="For Candidates"
              desc="Improve resume visibility, get better job matches, and track applications."
            />
            <ValueCard
              title="For Recruiters"
              desc="Analyze resumes instantly and focus only on the best talent."
            />
            <ValueCard
              title="AI Driven"
              desc="Leverage AI insights instead of manual shortlisting."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-8 py-20 text-center">
          <h2 className="text-3xl font-bold">
            Ready to Experience Smarter Hiring?
          </h2>

          <p className="mt-4 text-gray-300">
            Join now and see how AI transforms recruitment.
          </p>

          <Link
            href="/register"
            className="inline-block mt-8 bg-white text-black px-10 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between text-sm text-gray-500">
          <span>© 2026 Resume Analyzer</span>
          <span>AI Powered Recruitment Platform</span>
        </div>
      </footer>

    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Feature({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">
        {title}
      </h3>
      <p className="text-gray-600 mt-1">
        {children}
      </p>
    </div>
  );
}

function ValueCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-gray-50 border rounded-xl p-8 hover:shadow-lg transition">
      <h3 className="text-xl font-bold text-gray-900">
        {title}
      </h3>
      <p className="text-gray-600 mt-4">
        {desc}
      </p>
    </div>
  );
}

