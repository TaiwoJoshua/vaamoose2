import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bus, MapPin, Plus, LogOut, DollarSign,
  Calendar, Users, Package, ChevronRight, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface PartnerDashboardProps {
  onBack: () => void;
}

type DashboardTab = 'overview' | 'vehicles' | 'routes' | 'departures' | 'bookings';

export function PartnerDashboard({ onBack }: PartnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [partner, setPartner] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [showAddDeparture, setShowAddDeparture] = useState(false);

  // Vehicle form
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [vehiclePrice, setVehiclePrice] = useState('');
  const [vehicleFeatures, setVehicleFeatures] = useState('');

  // Route form
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [routePrice, setRoutePrice] = useState('');
  const [routeDistance, setRouteDistance] = useState('');
  const [routeDuration, setRouteDuration] = useState('');

  // Departure form
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [departureFrom, setDepartureFrom] = useState('');
  const [departureTo, setDepartureTo] = useState('');
  const [departureVehicle, setDepartureVehicle] = useState('');
  const [departureSeats, setDepartureSeats] = useState('');

  const token = localStorage.getItem('partnerToken');

  useEffect(() => {
    const savedPartner = localStorage.getItem('partner');
    if (savedPartner) setPartner(JSON.parse(savedPartner));
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/partners/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('partnerToken');
    localStorage.removeItem('partner');
    onBack();
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/partners/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: vehicleName,
          type: vehicleType,
          capacity: Number(vehicleCapacity),
          priceMultiplier: Number(vehiclePrice),
          features: vehicleFeatures.split(',').map((f) => f.trim()),
        }),
      });
      if (res.ok) {
        setShowAddVehicle(false);
        fetchDashboard();
        setVehicleName(''); setVehicleType('');
        setVehicleCapacity(''); setVehiclePrice(''); setVehicleFeatures('');
      }
    } catch (error) {
      console.error('Failed to add vehicle:', error);
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/partners/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from: routeFrom,
          to: routeTo,
          basePrice: Number(routePrice),
          distance: Number(routeDistance),
          estimatedDuration: Number(routeDuration),
        }),
      });
      if (res.ok) {
        setShowAddRoute(false);
        fetchDashboard();
        setRouteFrom(''); setRouteTo('');
        setRoutePrice(''); setRouteDistance(''); setRouteDuration('');
      }
    } catch (error) {
      console.error('Failed to add route:', error);
    }
  };

  const handleAddDeparture = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/partners/departures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: departureDate,
          time: departureTime,
          routeFrom: departureFrom,
          routeTo: departureTo,
          vehicleName: departureVehicle,
          availableSeats: Number(departureSeats),
        }),
      });
      if (res.ok) {
        setShowAddDeparture(false);
        fetchDashboard();
        setDepartureDate(''); setDepartureTime('');
        setDepartureFrom(''); setDepartureTo('');
        setDepartureVehicle(''); setDepartureSeats('');
      }
    } catch (error) {
      console.error('Failed to add departure:', error);
    }
  };

  const tabs: { id: DashboardTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'vehicles', label: 'Vehicles', icon: Bus },
    { id: 'routes', label: 'Routes', icon: MapPin },
    { id: 'departures', label: 'Departures', icon: Calendar },
    { id: 'bookings', label: 'Bookings', icon: Users },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{partner?.companyName}</h1>
            <p className="text-blue-100 text-sm mt-1">{partner?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-white border-white hover:bg-white/20 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Earnings', value: `₦${dashboardData?.earnings?.toLocaleString() || 0}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
                { label: 'Total Bookings', value: dashboardData?.bookings?.length || 0, icon: Users, color: 'text-blue-600 bg-blue-100' },
                { label: 'Vehicles', value: dashboardData?.partner?.vehicles?.length || 0, icon: Bus, color: 'text-amber-600 bg-amber-100' },
                { label: 'Routes', value: dashboardData?.partner?.routes?.length || 0, icon: MapPin, color: 'text-purple-600 bg-purple-100' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">{stat.label}</p>
                          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Add Vehicle', onClick: () => setShowAddVehicle(true), icon: Bus },
                    { label: 'Add Route', onClick: () => setShowAddRoute(true), icon: MapPin },
                    { label: 'Add Departure Date', onClick: () => setShowAddDeparture(true), icon: Calendar },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={action.onClick}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-slate-700">{action.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Your Vehicles</h2>
              <Button onClick={() => setShowAddVehicle(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> Add Vehicle
              </Button>
            </div>
            {dashboardData?.partner?.vehicles?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-slate-500">
                  No vehicles added yet. Click "Add Vehicle" to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData?.partner?.vehicles?.map((vehicle: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Bus className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{vehicle.name}</h3>
                          <p className="text-sm text-slate-500">{vehicle.type} • {vehicle.capacity} seats</p>
                          <p className="text-sm text-blue-600 font-medium mt-1">Price multiplier: x{vehicle.priceMultiplier}</p>
                          {vehicle.features?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {vehicle.features.map((f: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{f}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Routes Tab */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Your Routes</h2>
              <Button onClick={() => setShowAddRoute(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> Add Route
              </Button>
            </div>
            {dashboardData?.partner?.routes?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-slate-500">
                  No routes added yet. Click "Add Route" to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {dashboardData?.partner?.routes?.map((route: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{route.from} → {route.to}</h3>
                            <p className="text-sm text-slate-500">{route.distance}km • {Math.round(route.estimatedDuration / 60)} hours</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-blue-600">₦{route.basePrice?.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Departures Tab */}
        {activeTab === 'departures' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Departure Dates</h2>
              <Button onClick={() => setShowAddDeparture(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> Add Departure
              </Button>
            </div>
            {dashboardData?.partner?.departureDates?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-slate-500">
                  No departure dates added yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {dashboardData?.partner?.departureDates?.map((dep: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {dep.routeFrom} → {dep.routeTo}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {new Date(dep.date).toLocaleDateString()} at {dep.time} • {dep.vehicleName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-emerald-600">{dep.availableSeats} seats available</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Student Bookings</h2>
            {dashboardData?.bookings?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-slate-500">
                  No bookings yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {dashboardData?.bookings?.map((booking: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-slate-900">{booking.schoolName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 text-sm">To: {booking.route}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 text-sm">
                              {new Date(booking.departureDate).toLocaleDateString()} at {booking.departureTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 text-sm">
                              {booking.seats?.length} seat(s) •
                              {booking.seats?.map((s: any) => ` Row ${s.row} Seat ${s.column}`).join(',')}
                            </span>
                          </div>
                          {/* Luggage Photos */}
                          {booking.luggagePhotos?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-slate-500 mb-1">Luggage Photos:</p>
                              <div className="flex gap-2">
                                {booking.luggagePhotos.map((photo: string, i: number) => (
                                  <div key={i} className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-slate-400" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-600">₦{booking.price?.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            booking.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Vehicle</h3>
              <button onClick={() => setShowAddVehicle(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <Label>Vehicle Name</Label>
                <Input placeholder="e.g. Toyota Hiace" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} required />
              </div>
              <div>
                <Label>Type</Label>
                <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" required>
                  <option value="">Select type</option>
                  <option value="sedan">Sedan</option>
                  <option value="minivan">Minivan</option>
                  <option value="luxury-bus">Luxury Bus</option>
                </select>
              </div>
              <div>
                <Label>Capacity (seats)</Label>
                <Input type="number" placeholder="e.g. 14" value={vehicleCapacity} onChange={(e) => setVehicleCapacity(e.target.value)} required />
              </div>
              <div>
                <Label>Price Multiplier</Label>
                <Input type="number" step="0.1" placeholder="e.g. 1.5" value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value)} required />
              </div>
              <div>
                <Label>Features (comma separated)</Label>
                <Input placeholder="e.g. AC, WiFi, USB Charging" value={vehicleFeatures} onChange={(e) => setVehicleFeatures(e.target.value)} />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Add Vehicle</Button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Route Modal */}
      {showAddRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Route</h3>
              <button onClick={() => setShowAddRoute(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddRoute} className="space-y-4">
              <div>
                <Label>From</Label>
                <Input placeholder="e.g. Covenant University" value={routeFrom} onChange={(e) => setRouteFrom(e.target.value)} required />
              </div>
              <div>
                <Label>To</Label>
                <Input placeholder="e.g. Lagos" value={routeTo} onChange={(e) => setRouteTo(e.target.value)} required />
              </div>
              <div>
                <Label>Base Price (₦)</Label>
                <Input type="number" placeholder="e.g. 5000" value={routePrice} onChange={(e) => setRoutePrice(e.target.value)} required />
              </div>
              <div>
                <Label>Distance (km)</Label>
                <Input type="number" placeholder="e.g. 80" value={routeDistance} onChange={(e) => setRouteDistance(e.target.value)} required />
              </div>
              <div>
                <Label>Estimated Duration (minutes)</Label>
                <Input type="number" placeholder="e.g. 120" value={routeDuration} onChange={(e) => setRouteDuration(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Add Route</Button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Departure Modal */}
      {showAddDeparture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Departure Date</h3>
              <button onClick={() => setShowAddDeparture(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddDeparture} className="space-y-4">
              <div>
                <Label>From</Label>
                <Input placeholder="e.g. Covenant University" value={departureFrom} onChange={(e) => setDepartureFrom(e.target.value)} required />
              </div>
              <div>
                <Label>To</Label>
                <Input placeholder="e.g. Lagos" value={departureTo} onChange={(e) => setDepartureTo(e.target.value)} required />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
              </div>
              <div>
                <Label>Time</Label>
                <select value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" required>
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
              <div>
                <Label>Vehicle Name</Label>
                <Input placeholder="e.g. Toyota Hiace" value={departureVehicle} onChange={(e) => setDepartureVehicle(e.target.value)} required />
              </div>
              <div>
                <Label>Available Seats</Label>
                <Input type="number" placeholder="e.g. 14" value={departureSeats} onChange={(e) => setDepartureSeats(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Add Departure</Button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}