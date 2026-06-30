import { Link } from 'wouter';
import {
  Users,
  BookOpen,
  Heart,
  MessageSquare,
  Shield,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Member Management',
    description:
      'Keep your congregation connected. Manage member profiles, roles, and contact info in one place.',
  },
  {
    icon: Heart,
    title: 'Prayer Wall',
    description:
      'Lift one another up. Members can post and pray for needs within the safety of your church community.',
  },
  {
    icon: Users,
    title: 'Small Groups',
    description:
      'Organize Bible studies, youth groups, and ministry teams — all tied to your church directory.',
  },
  {
    icon: BookOpen,
    title: 'Sermon Notes',
    description:
      'Pastors can publish sermon notes and outlines. Members can follow along and save highlights.',
  },
  {
    icon: MessageSquare,
    title: 'Church Announcements',
    description:
      'Share news, events, and reminders with your entire congregation or specific groups.',
  },
  {
    icon: Shield,
    title: 'Doctrinally Vetted',
    description:
      'Every church on Seeking Higher has affirmed our Statement of Faith before being listed.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Seeking Higher Church
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/find-church" className="text-white/80 hover:text-white transition-colors">
              Find a Church
            </Link>
            <Link href="/login" className="text-white/80 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gold text-navy font-semibold px-4 py-1.5 rounded-md hover:bg-gold/90 transition-colors"
            >
              Register Church
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-navy text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm px-4 py-1.5 rounded-full mb-6">
            <Shield className="w-4 h-4 text-gold" />
            Built on the Word. For the Church.
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Seeking Higher{' '}
            <span className="text-gold">Church</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Connect your congregation with tools built on the Word. Manage members, share
            prayer requests, organize groups, and grow together in Christ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-gold text-navy font-semibold px-8 py-3 rounded-md text-lg hover:bg-gold/90 transition-colors"
            >
              Register Your Church
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/find-church"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-3 rounded-md text-lg hover:bg-white/20 transition-colors"
            >
              Find Your Church
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Everything your church needs
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Purpose-built tools for local churches — simple enough for any congregation,
              faithful to the mission of the Church.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-navy" />
                </div>
                <h3 className="font-semibold text-navy mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">
            Ready to register your church?
          </h2>
          <p className="text-muted-foreground mb-8">
            Registration is free. We review every church application to ensure doctrinal
            alignment before approval. Most churches are approved within 1–2 business days.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-navy text-white font-semibold px-8 py-3 rounded-md text-lg hover:bg-navy/90 transition-colors"
          >
            Get Started
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white/70 mt-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-gold" />
                <span className="font-semibold text-white">Seeking Higher Church</span>
              </div>
              <p className="text-sm leading-relaxed">
                A sister platform to Seeking Higher — built for local churches who hold to
                the historic Christian faith.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div>
                <p className="text-white font-medium mb-3">Platform</p>
                <ul className="space-y-2">
                  <li>
                    <Link href="/find-church" className="hover:text-white transition-colors">
                      Find a Church
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-white transition-colors">
                      Register
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-white transition-colors">
                      Sign In
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-xs text-white/50">
            <p className="mb-2">
              <strong className="text-white/70">Statement of Faith:</strong> We affirm the
              full authority of Scripture, the doctrine of the Trinity, the full deity and
              humanity of Christ, salvation by grace through faith alone, the atoning death
              and bodily resurrection of Jesus Christ, and the call to faithful discipleship
              within the body of Christ.
            </p>
            <p className="mt-4">
              &copy; {new Date().getFullYear()} Seeking Higher Church. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
