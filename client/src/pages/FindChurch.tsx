import { useState } from 'react';
import { Link } from 'wouter';
import { Search, MapPin, Shield, BookOpen, ArrowRight } from 'lucide-react';
import { trpc } from '../lib/trpc';

export default function FindChurch() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data: results, isLoading } = trpc.church.search.useQuery(
    { query: submitted },
    { enabled: submitted.length >= 1 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(query.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-navy" />
            </div>
            <span className="font-semibold text-sm">Seeking Higher Church</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-white/80 hover:text-white">Sign In</Link>
            <Link href="/register" className="bg-gold text-navy font-semibold px-3 py-1.5 rounded-md hover:bg-gold/90 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-navy mb-3">Find a Church</h1>
          <p className="text-muted-foreground">
            Search for approved churches by name, city, or state. Every church listed
            has affirmed the Seeking Higher Statement of Faith.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Church name, city, or state…"
              className="w-full pl-10 pr-4 py-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={query.trim().length < 1}
            className="bg-navy text-white font-semibold px-6 py-3 rounded-md hover:bg-navy/90 transition-colors disabled:opacity-40"
          >
            Search
          </button>
        </form>

        {/* Results */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-6 animate-pulse">
                <div className="h-5 bg-muted rounded w-48 mb-2" />
                <div className="h-3 bg-muted rounded w-32 mb-4" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {submitted && !isLoading && results && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No churches found for &ldquo;{submitted}&rdquo;</p>
            <p className="text-sm mt-1">Try a different name, city, or state.</p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {results.length} church{results.length !== 1 ? 'es' : ''} found
            </p>
            {results.map((church) => (
              <Link key={church.id} href={`/church/${church.slug}`}>
                <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md hover:border-navy/20 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-navy text-lg group-hover:text-navy/80 transition-colors">
                          {church.name}
                        </h3>
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full shrink-0">
                          <Shield className="w-3 h-3" />
                          Doctrinally Affirmed
                        </span>
                      </div>
                      {church.pastorName && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {church.pastorTitle ?? 'Pastor'} {church.pastorName}
                        </p>
                      )}
                      {(church.city || church.state) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-3.5 h-3.5" />
                          {[church.city, church.state].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {church.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {church.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-navy transition-colors shrink-0 mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!submitted && (
          <div className="text-center text-muted-foreground py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Enter a search term above to find churches.</p>
          </div>
        )}
      </div>
    </div>
  );
}
