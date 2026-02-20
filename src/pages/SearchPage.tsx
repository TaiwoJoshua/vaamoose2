import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, ArrowLeft, Bus, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface SearchPageProps {
  onBack: () => void;
  onBook: (partnerId: string) => void;
}

export function SearchPage({ onBack, onBook }: SearchPageProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (date) params.append('date', date);

      const res = await fetch(
        `http://localhost:5000/api/partners/departures?${params.toString()}`
      );
      const data = await res.json();
      setResults(data.departures || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Search Rides</h1>
            <p className="text-slate-500 text-sm">Find available rides from partners</p>
          </div>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>From</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="e.g. Covenant University"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <Input
                    placeholder="e.g. Lagos"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search Available Rides'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {results.length > 0 
                ? `${results.length} ride(s) found` 
                : 'No rides found'}
            </h2>

            {results.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bus className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No rides available
                  </h3>
                  <p className="text-slate-500">
                    Try different dates or destinations
                  </p>
                </CardContent>
              </Card>
            )}

            {results.map((departure, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        {/* Company */}
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Bus className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {departure.partnerName}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {departure.partnerPhone}
                            </p>
                          </div>
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="font-medium text-slate-900">
                              {departure.routeFrom}
                            </p>
                          </div>
                          <div className="flex-1 h-px bg-slate-200 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="bg-white px-2 text-xs text-slate-400">→</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-slate-900">
                              {departure.routeTo}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(departure.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {departure.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {departure.availableSeats} seats available
                          </div>
                        </div>

                        {/* Vehicle */}
                        <p className="text-sm text-slate-600">
                          Vehicle: <span className="font-medium">{departure.vehicleName}</span>
                        </p>
                      </div>

                      {/* Book Button */}
                      <div className="ml-4">
                        <Button
                          onClick={() => onBook(departure.partnerId)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}