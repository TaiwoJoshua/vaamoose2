import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  MapPin, 
  Bus, 
  Camera,
  CreditCard,
  Star,
  Wifi,
  Wind,
  BatteryCharging,
  Droplets,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { schools, generateSeats } from '@/data/Data';
import { usePartners } from '@/hooks/usePartners';
import type { TransportCompany, Vehicle, Seat, Route } from '@/types';
import { toast } from 'sonner';

interface BookingFlowProps {
  schoolId: string | null;
  onBack: () => void;
  onComplete: () => void;
}

type BookingStep = 
  | 'school'
  | 'company'
  | 'vehicle'
  | 'seats'
  | 'route'
  | 'luggage'
  | 'summary';

const amenitiesIcons: Record<string, React.ElementType> = {
  'WiFi': Wifi,
  'AC': Wind,
  'USB Charging': BatteryCharging,
  'Water': Droplets,
};

export function BookingFlow({ schoolId, onBack}: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('company');
  const [selectedCompany, setSelectedCompany] = useState<TransportCompany | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [luggagePhotos, setLuggagePhotos] = useState<string[]>([]);
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const { transportCompanies } = usePartners();

  const school = schools.find(s => s.id === schoolId);
  const availableCompanies = transportCompanies; // show all partners to students
const availableRoutes = selectedCompany
  ? selectedCompany.availableRoutes.map((r: any, i: number) => ({
      id: r._id || String(i),
      from: r.from,
      to: r.to,
      distance: r.distance,
      estimatedDuration: r.estimatedDuration,
      basePrice: r.basePrice,
      popular: false,
    }))
  : [];
  const steps: { id: BookingStep; label: string }[] = [
    { id: 'company', label: 'Company' },
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'seats', label: 'Seats' },
    { id: 'route', label: 'Route' },
    { id: 'luggage', label: 'Luggage' },
    { id: 'summary', label: 'Summary' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    } else {
      onBack();
    }
  };

  const handleCompanySelect = (company: TransportCompany) => {
    setSelectedCompany(company);
    handleNext();
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSeats(generateSeats(vehicle.type));
    setSelectedSeats([]);
    handleNext();
  };

  const handleSeatToggle = (seat: Seat) => {
    if (seat.status === 'occupied') return;
    
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id);
      if (exists) {
        return prev.filter(s => s.id !== seat.id);
      }
      return [...prev, seat];
    });
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    handleNext();
  };

 
  const calculateTotal = () => {
    if (!selectedRoute || !selectedVehicle) return 0;
    
    let total = selectedRoute.basePrice * selectedVehicle.priceMultiplier;
    
    // Add seat prices
    selectedSeats.forEach(seat => {
      total += seat.price;
    });
    
    return Math.round(total);
  };

  // --- Fully integrated handleBooking ---
 const handleBooking = async () => {
  if (!selectedCompany || !selectedVehicle || selectedSeats.length === 0 || !selectedRoute || !departureDate || !departureTime) {
    toast.error('Please complete all booking steps before confirming.');
    return;
  }

  try {
    const bookingData = {
      schoolId,
      schoolName: school?.name,
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      seats: selectedSeats.map(seat => ({
        row: seat.row,
        column: seat.column,
        type: seat.type,
        price: seat.price,
      })),
      routeId: selectedRoute.id,
      routeTo: selectedRoute.to,
      departureDate,
      departureTime,
      totalPrice: calculateTotal(),
      luggagePhotos,
    };

    // Get user email from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const res = await fetch('http://localhost:5000/api/payment/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        amount: calculateTotal(),
        bookingData,
      }),
    });

    const data = await res.json();

    if (data.authorizationUrl) {
      // Save reference to localStorage so we can verify later
      localStorage.setItem('paymentReference', data.reference);
      // Redirect to Paystack payment page
      window.location.href = data.authorizationUrl;
    } else {
      toast.error('Could not initialize payment. Please try again.');
    }
  } catch (err) {
    console.error('Payment error:', err);
    toast.error('Error processing payment. Please try again.');
  }
};
  // --- End handleBooking ---

  const renderStepContent = () => {
    switch (currentStep) {
      case 'company':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Choose Your Transport Partner
              </h2>
              <p className="text-slate-600">
                Available transport companies at {school?.name}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableCompanies.map((company) => (
                <motion.div
                  key={company.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${selectedCompany?.id === company.id ? 'ring-2 ring-blue-600 border-blue-600' : 'hover:shadow-lg'}`}
                    onClick={() => handleCompanySelect(company)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Bus className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="font-medium">{company.rating}</span>
                              <span className="text-slate-400 text-sm">({company.reviewCount})</span>
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm mb-4">{company.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {company.amenities.slice(0, 4).map((amenity) => {
                              const Icon = amenitiesIcons[amenity] || CheckCircle2;
                              return (
                                <span key={amenity} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-xs text-slate-600">
                                  <Icon className="w-3 h-3" /> {amenity}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
     case 'vehicle':
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Choose Your Ride
        </h2>
        <p className="text-slate-600">
          Select the vehicle type that fits your journey
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(selectedCompany?.vehicles || []).map((vehicle: any) => (
          <motion.div
            key={vehicle._id || vehicle.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer h-full transition-all ${
                selectedVehicle?.id === (vehicle._id || vehicle.id)
                  ? 'ring-2 ring-blue-600 border-blue-600'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleVehicleSelect({
                ...vehicle,
                id: vehicle._id || vehicle.id,
              })}
            >
              <CardContent className="p-6">
                <div className="w-full h-32 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                  <Bus className="w-16 h-16 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {vehicle.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-600">
                    Capacity: <span className="font-medium">{vehicle.capacity} passengers</span>
                  </p>
                </div>
                <div className="space-y-1 mb-4">
                  {(vehicle.features || []).map((feature: string) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Price multiplier: <span className="font-semibold text-blue-600">x{vehicle.priceMultiplier}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
      case 'seats':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Select Your Seats
              </h2>
              <p className="text-slate-600">
                Choose your preferred seating position
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Seat Map */}
              <div className="flex-1">
                <Card className="p-6">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-8 bg-slate-200 rounded-t-lg flex items-center justify-center text-sm text-slate-500">
                      FRONT
                    </div>
                  </div>
                  
                  <div className="grid gap-3 justify-center">
                    {Array.from(new Set(seats.map(s => s.row))).map((row) => (
                      <div key={row} className="flex gap-3">
                        {seats.filter(s => s.row === row).map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatToggle(seat)}
                            disabled={seat.status === 'occupied'}
                            className={`
                              w-12 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                              ${seat.status === 'occupied' 
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                : selectedSeats.find(s => s.id === seat.id)
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : seat.type === 'window'
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-2 border-emerald-300'
                                    : seat.type === 'front'
                                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-2 border-amber-300'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-slate-300'
                              }
                            `}
                          >
                            {seat.row}-{seat.column}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-6">
                    <div className="w-24 h-8 bg-slate-200 rounded-b-lg flex items-center justify-center text-sm text-slate-500">
                      BACK
                    </div>
                  </div>
                </Card>
              </div>

              {/* Legend & Selection */}
              <div className="lg:w-80">
                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Seat Legend</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 border-2 border-emerald-300 rounded-lg" />
                      <span className="text-sm text-slate-600">Window (+₦200)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 border-2 border-amber-300 rounded-lg" />
                      <span className="text-sm text-slate-600">Front Row (+₦500)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 border-2 border-slate-300 rounded-lg" />
                      <span className="text-sm text-slate-600">Standard (Free)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                      <span className="text-sm text-slate-600">Occupied</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg" />
                      <span className="text-sm text-slate-600">Selected</span>
                    </div>
                  </div>

                  {selectedSeats.length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="font-medium text-slate-900 mb-2">Selected Seats</h4>
                      <div className="space-y-2">
                        {selectedSeats.map((seat) => (
                          <div key={seat.id} className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              Row {seat.row}, Seat {seat.column} ({seat.type})
                            </span>
                            <span className="font-medium">₦{seat.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-blue-600">
                            ₦{selectedSeats.reduce((sum, s) => sum + s.price, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        );

      case 'route':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Where Are You Headed?
              </h2>
              <p className="text-slate-600">
                Select your destination and travel date
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Route Selection */}
              <div className="lg:col-span-2 space-y-4">
                {availableRoutes.map((route) => (
                  <motion.div
                    key={route.id}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedRoute?.id === route.id 
                          ? 'ring-2 ring-blue-600 border-blue-600' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleRouteSelect(route)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{route.to}</h3>
                              <p className="text-sm text-slate-500">
                                {route.distance} km • {Math.round(route.estimatedDuration / 60)} hours
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              ₦{Math.round(route.basePrice * (selectedVehicle?.priceMultiplier || 1))}
                            </p>
                            <p className="text-sm text-slate-500">per person</p>
                          </div>
                        </div>
                        {route.popular && (
                          <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium">
                            <Star className="w-3 h-3" />
                            Popular Route
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Date & Time Selection */}
              <div>
                <Card className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Travel Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Departure Date
                      </label>
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Departure Time
                      </label>
                      <select
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select time</option>
                        <option value="06:00">6:00 AM</option>
                        <option value="08:00">8:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="18:00">6:00 PM</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'luggage':
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Snap Your Luggage
        </h2>
        <p className="text-slate-600">
          Help drivers prepare adequate space for your items
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Upload Luggage Photos
            </h3>
            <p className="text-slate-600 mb-4">
              Take a clear photo of all your luggage items
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="luggage-upload"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;

                toast.loading('Uploading photos...');

                try {
                  const uploadedUrls: string[] = [];

                  for (const file of files) {
                    const formData = new FormData();
                    formData.append('photo', file);

                    const res = await fetch('http://localhost:5000/api/upload/luggage', {
                      method: 'POST',
                      body: formData,
                    });

                    const data = await res.json();
                    if (data.url) uploadedUrls.push(data.url);
                  }

                  setLuggagePhotos(uploadedUrls);
                  toast.success('Photos uploaded successfully!');
                } catch (error) {
                  toast.error('Failed to upload photos. Please try again.');
                }
              }}
            />
            <label htmlFor="luggage-upload">
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                onClick={() => document.getElementById('luggage-upload')?.click()}
              >
                Choose Photos
              </Button>
            </label>
          </div>

          {/* Preview uploaded photos */}
          {luggagePhotos.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-slate-900 mb-3">
                Uploaded Photos ({luggagePhotos.length})
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {luggagePhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Luggage ${index + 1}`}
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => setLuggagePhotos(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <h4 className="font-medium text-slate-900 mb-2">Guidelines</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Take a clear photo of all your luggage
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Include bags, boxes, and any large items
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                First 20kg included, ₦100 per extra kg
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
      case 'summary':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Review Your Booking
              </h2>
              <p className="text-slate-600">Confirm all details before payment</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <Card className="p-6">
                {/* Booking Details, Price Breakdown & Payment Method */}
                <div className="space-y-6"> 
                  <div className="flex items-center gap-4 pb-6 border-b border-slate-100"> 
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"> <Bus className="w-6 h-6 text-blue-600" /> 
                    
                    </div> 
                    <div> 
                      <p className="text-sm text-slate-500">Transport Company</p> 
                      <p className="font-semibold text-slate-900">{selectedCompany?.name}</p> 
                    </div> 
                  </div> 
                  
                  <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">   
                    <div> 
                      <p className="text-sm text-slate-500">From</p> 
                      <p className="font-medium text-slate-900">{school?.name}</p> 
                    </div> 
                    <div> 
                      <p className="text-sm text-slate-500">To</p> 
                      <p className="font-medium text-slate-900">{selectedRoute?.to}</p> 
                      
                    </div> 
                    <div> 
                      <p className="text-sm text-slate-500">Date</p> 
                      <p className="font-medium text-slate-900">{departureDate || 'Not selected'}
                      </p> 
                    </div> 
                    
                    <div> 
                      <p className="text-sm text-slate-500">Time</p> 
                      <p className="font-medium text-slate-900">{departureTime || 'Not selected'}</p> 
                    </div> 
                  </div> 
                  
                  <div className="pb-6 border-b border-slate-100"> 
                    <p className="text-sm text-slate-500 mb-2">Vehicle</p> 
                    <p className="font-medium text-slate-900">{selectedVehicle?.name}</p> <p className="text-sm text-slate-600">{selectedSeats.length} seat(s) selected</p>
                  </div>
                  </div> {/* Price Breakdown */} 
                    <div className="space-y-3"> 
                      <div className="flex justify-between text-sm"> 
                        <span className="text-slate-600">Base fare</span> 
                        <span className="font-medium">₦{selectedRoute?.basePrice}</span> 
                      </div> 
                      <div className="flex justify-between text-sm"> 
                        <span className="text-slate-600">Vehicle multiplier</span> 
                        <span className="font-medium">x{selectedVehicle?.priceMultiplier}</span> 
                      </div> 
                      <div className="flex justify-between text-sm"> 
                        <span className="text-slate-600">Seat upgrades</span> 
                        <span className="font-medium">₦{selectedSeats.reduce((sum, s) => sum + s.price, 0)}</span> 
                      </div> 
                      <div className="pt-3 border-t border-slate-100 flex justify-between"> 
                        <span className="font-semibold text-slate-900">Total</span> 
                        <span className="text-2xl font-bold text-blue-600">₦{calculateTotal()}</span> 
                      </div> 
                    </div> 
                    {/* Payment Methods */} 
                    <div className="pt-6 border-t border-slate-100"> 
                      <p className="font-medium text-slate-900 mb-3">Payment Method</p> 
                      
                      <div className="grid grid-cols-3 gap-3"> {['Card', 'Bank Transfer', 'USSD'].map((method) => (
                        <button
                          key={method}
                          onClick={() => setSelectedPaymentMethod(method)}
                          className={`p-3 border rounded-lg text-center transition-all ${
                            selectedPaymentMethod === method
                              ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                              : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                            selectedPaymentMethod === method ? 'text-blue-600' : 'text-slate-400'
                          }`} />
                          <span className={`text-sm ${
                            selectedPaymentMethod === method ? 'text-blue-600 font-medium' : 'text-slate-600'
                          }`}>
                            {method}
                          </span>
                        </button>
                      ))}

                    </div> 
                  </div>

               
                <Button
                  onClick={handleBooking}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                >
                  Confirm & Pay ₦{calculateTotal()}
                </Button>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${index <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${index <= currentStepIndex ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && <div className={`w-8 sm:w-12 h-0.5 mx-2 sm:mx-4 ${index < currentStepIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          {currentStep !== 'company' && currentStep !== 'summary' && (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 'seats' && selectedSeats.length === 0) ||
                (currentStep === 'route' && !selectedRoute)
              }
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
