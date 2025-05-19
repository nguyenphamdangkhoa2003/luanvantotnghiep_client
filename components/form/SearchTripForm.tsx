'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, MapPin, Users } from 'lucide-react';
import { z } from 'zod';
import { useContext, useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';
import { useRouter, usePathname } from 'next/navigation';
import { format, isBefore, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
    UserLocationContext,
    UserLocationContextType,
} from '@/hooks/use-user-location-context';
import mapboxgl from 'mapbox-gl'; 

const schema = z.object({
    pickup: z.string().min(1, 'Điểm đón không được để trống'),
    dropoff: z.string().min(1, 'Điểm đến không được để trống'),
    date: z
        .string()
        .min(1, 'Vui lòng chọn ngày khởi hành')
        .refine(
            (value) => {
                const selectedDate = new Date(value);
                const today = startOfDay(new Date());
                return !isBefore(selectedDate, today);
            },
            { message: 'Ngày khởi hành không được nhỏ hơn ngày hiện tại' }
        ),
    passengers: z
        .number({
            required_error: 'Vui lòng nhập số người',
            invalid_type_error: 'Vui lòng nhập số người',
        })
        .min(1, 'Số người ít nhất là 1')
        .max(4, 'Tối đa 4 người'),
});

type FormData = z.infer<typeof schema>;

type Coordinates = {
    lng: number;
    lat: number;
};

export default function SearchTrip() {
    const userLocationContext = useContext(UserLocationContext);
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            pickup: '',
            dropoff: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            passengers: 1,
        },
    });
    const [pickupQuery, setPickupQuery] = useState('');
    const [dropoffQuery, setDropoffQuery] = useState('');
    const [pickupSuggestions, setPickupSuggestions] = useState<
        { place_id: string; description: string; coordinates: Coordinates }[]
    >([]);
    const [dropoffSuggestions, setDropoffSuggestions] = useState<
        { place_id: string; description: string; coordinates: Coordinates }[]
    >([]);
    const [pickupOpen, setPickupOpen] = useState(false);
    const [dropoffOpen, setDropoffOpen] = useState(false);
    const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
    const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(
        null
    );
    const [route, setRoute] = useState<any>(null);

    const router = useRouter();
    const pathname = usePathname();
    const mapRef = useRef<any>(null);

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    // Fetch suggestions from Mapbox Geocoding API
    const fetchSuggestions = async (
        query: string,
        setter: (
            suggestions: {
                place_id: string;
                description: string;
                coordinates: Coordinates;
            }[]
        ) => void
    ) => {
        if (query.length < 2) {
            setter([]);
            return;
        }

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    query
                )}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,poi,address&language=vi`
            );
            const data = await response.json();
            const suggestions = data.features.map((feature: any) => ({
                place_id: feature.id,
                description: feature.place_name,
                coordinates: {
                    lng: feature.geometry.coordinates[0],
                    lat: feature.geometry.coordinates[1],
                },
            }));
            setter(suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setter([]);
        }
    };

    // Fetch route from Mapbox Directions API
    const fetchRoute = async (start: Coordinates, end: Coordinates) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
            );
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                setRoute(data.routes[0].geometry);
                // Adjust map to fit the route
                if (mapRef.current) {
                    const coordinates = data.routes[0].geometry.coordinates;
                    const bounds = coordinates.reduce(
                        (bounds: any, coord: [number, number]) => {
                            return bounds.extend(coord);
                        },
                        new mapboxgl.LngLatBounds(
                            coordinates[0],
                            coordinates[0]
                        )
                    );
                    mapRef.current.fitBounds(bounds, { padding: 50 });
                }
            }
        } catch (error) {
            console.error('Error fetching route:', error);
        }
    };

    // Fetch pickup suggestions
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSuggestions(pickupQuery, setPickupSuggestions);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [pickupQuery]);

    // Fetch dropoff suggestions
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSuggestions(dropoffQuery, setDropoffSuggestions);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [dropoffQuery]);

    // Fetch route when both pickup and dropoff coordinates are available
    useEffect(() => {
        if (pickupCoords && dropoffCoords) {
            fetchRoute(pickupCoords, dropoffCoords);
        }
    }, [pickupCoords, dropoffCoords]);

    // Save form data to localStorage
    useEffect(() => {
        const subscription = watch((values) => {
            localStorage.setItem('searchTripForm', JSON.stringify(values));
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    // Restore data from localStorage
    useEffect(() => {
        const storedData = localStorage.getItem('searchTripForm');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            Object.keys(parsedData).forEach((key: any) => {
                setValue(key, parsedData[key]);
            });
        }
    }, [setValue]);

    const onSubmit = (data: FormData) => {
        console.log('Dữ liệu hợp lệ:', data);
        localStorage.removeItem('searchTripForm');
        const queryParams = new URLSearchParams({
            pickup: data.pickup,
            dropoff: data.dropoff,
            date: data.date,
            passengers: data.passengers.toString(),
        }).toString();

        if (pathname === '/') {
            router.push(`/booking?${queryParams}`);
        } else {
            router.replace(`/booking?${queryParams}`);
        }
    };

    // State for date picker
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date()
    );

    // Sync date with form
    useEffect(() => {
        if (selectedDate) {
            setValue('date', format(selectedDate, 'yyyy-MM-dd'));
        } else {
            setValue('date', '');
        }
    }, [selectedDate, setValue]);

    // Restore date from form state
    useEffect(() => {
        const dateValue = watch('date');
        if (dateValue) {
            const parsedDate = new Date(dateValue);
            const today = startOfDay(new Date());
            if (!isBefore(parsedDate, today)) {
                setSelectedDate(parsedDate);
            } else {
                setSelectedDate(new Date());
                setValue('date', format(new Date(), 'yyyy-MM-dd'));
            }
        } else {
            setSelectedDate(undefined);
        }
    }, [watch('date'), setValue]);

    const hasErrors =
        errors.pickup || errors.dropoff || errors.date || errors.passengers;

    return (
        <div className="flex flex-col items-center mt-5 px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-[var(--card)] p-8 rounded-2xl shadow-xl w-full max-w-6xl border border-[var(--border)]">
                <h2 className="text-2xl font-semibold text-center text-[var(--foreground)] mb-6">
                    Tìm chuyến xe
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Điểm đón */}
                    <div>
                        <label className="block text-[var(--foreground)] text-sm font-medium mb-2">
                            Điểm đón
                        </label>
                        <Popover open={pickupOpen} onOpenChange={setPickupOpen}>
                            <PopoverTrigger asChild>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                                    <Input
                                        {...register('pickup')}
                                        placeholder="Nhập điểm đón..."
                                        value={watch('pickup')}
                                        onChange={(e) => {
                                            setValue('pickup', e.target.value);
                                            setPickupQuery(e.target.value);
                                            if (e.target.value.length > 1) {
                                                setPickupOpen(true);
                                            }
                                        }}
                                        className="pl-10 h-11 rounded-lg border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] transition-all"
                                    />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent
                                className="p-0 rounded-lg border border-[var(--border)] bg-[var(--card)] max-h-64 overflow-y-auto"
                                align="start"
                                sideOffset={6}>
                                <Command className="rounded-lg">
                                    <div className="px-3 py-2 border-b border-[var(--border)]">
                                        <CommandInput
                                            placeholder="Tìm kiếm điểm đón..."
                                            value={pickupQuery}
                                            onValueChange={(value) => {
                                                setPickupQuery(value);
                                                setValue('pickup', value);
                                            }}
                                            className="h-10 border-none focus:ring-0 text-sm"
                                        />
                                    </div>
                                    <CommandList>
                                        <CommandEmpty className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                                            Không tìm thấy kết quả
                                        </CommandEmpty>
                                        {pickupSuggestions.length > 0 && (
                                            <CommandGroup>
                                                {pickupSuggestions.map(
                                                    (suggestion) => (
                                                        <CommandItem
                                                            key={
                                                                suggestion.place_id
                                                            }
                                                            value={
                                                                suggestion.description
                                                            }
                                                            onSelect={(
                                                                value
                                                            ) => {
                                                                setValue(
                                                                    'pickup',
                                                                    value
                                                                );
                                                                setPickupQuery(
                                                                    value
                                                                );
                                                                setPickupCoords(
                                                                    suggestion.coordinates
                                                                );
                                                                setPickupOpen(
                                                                    false
                                                                );
                                                            }}
                                                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-[var(--muted)] transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                                                                <span className="truncate">
                                                                    {
                                                                        suggestion.description
                                                                    }
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    )
                                                )}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {errors.pickup && (
                            <p className="text-[var(--destructive)] text-xs mt-1.5 font-medium">
                                {errors.pickup.message}
                            </p>
                        )}
                    </div>

                    {/* Điểm đến */}
                    <div>
                        <label className="block text-[var(--foreground)] text-sm font-medium mb-2">
                            Điểm đến
                        </label>
                        <Popover
                            open={dropoffOpen}
                            onOpenChange={setDropoffOpen}>
                            <PopoverTrigger asChild>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                                    <Input
                                        {...register('dropoff')}
                                        placeholder="Nhập điểm đến..."
                                        value={watch('dropoff')}
                                        onChange={(e) => {
                                            setValue('dropoff', e.target.value);
                                            setDropoffQuery(e.target.value);
                                            if (e.target.value.length > 1) {
                                                setDropoffOpen(true);
                                            }
                                        }}
                                        className="pl-10 h-11 rounded-lg border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] transition-all"
                                    />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent
                                className="p-0 rounded-lg border border-[var(--border)] bg-[var(--card)] max-h-64 overflow-y-auto"
                                align="start"
                                sideOffset={6}>
                                <Command className="rounded-lg">
                                    <div className="px-3 py-2 border-b border-[var(--border)]">
                                        <CommandInput
                                            placeholder="Tìm kiếm điểm đến..."
                                            value={dropoffQuery}
                                            onValueChange={(value) => {
                                                setDropoffQuery(value);
                                                setValue('dropoff', value);
                                            }}
                                            className="h-10 border-none focus:ring-0 text-sm"
                                        />
                                    </div>
                                    <CommandList>
                                        <CommandEmpty className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                                            Không tìm thấy kết quả
                                        </CommandEmpty>
                                        {dropoffSuggestions.length > 0 && (
                                            <CommandGroup>
                                                {dropoffSuggestions.map(
                                                    (suggestion) => (
                                                        <CommandItem
                                                            key={
                                                                suggestion.place_id
                                                            }
                                                            value={
                                                                suggestion.description
                                                            }
                                                            onSelect={(
                                                                value
                                                            ) => {
                                                                setValue(
                                                                    'dropoff',
                                                                    value
                                                                );
                                                                setDropoffQuery(
                                                                    value
                                                                );
                                                                setDropoffCoords(
                                                                    suggestion.coordinates
                                                                );
                                                                setDropoffOpen(
                                                                    false
                                                                );
                                                            }}
                                                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-[var(--muted)] transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                                                                <span className="truncate">
                                                                    {
                                                                        suggestion.description
                                                                    }
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    )
                                                )}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {errors.dropoff && (
                            <p className="text-[var(--destructive)] text-xs mt-1.5 font-medium">
                                {errors.dropoff.message}
                            </p>
                        )}
                    </div>

                    {/* Ngày khởi hành */}
                    <div>
                        <label className="block text-[var(--foreground)] text-sm font-medium mb-2">
                            Ngày khởi hành
                        </label>
                        <div className="relative">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'pl-10 h-11 w-full rounded-lg border-[var(--border)] text-left font-normal',
                                            !selectedDate &&
                                                'text-[var(--muted-foreground)]',
                                            'focus:ring-2 focus:ring-[var(--primary)] transition-all'
                                        )}>
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                                        {selectedDate ? (
                                            format(selectedDate, 'dd/MM/yyyy')
                                        ) : (
                                            <span>Chọn ngày</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 rounded-lg border-[var(--border)] bg-[var(--card)]"
                                    align="start"
                                    sideOffset={6}>
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        fromDate={new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        {errors.date && (
                            <p className="text-[var(--destructive)] text-xs mt-1.5 font-medium">
                                {errors.date.message}
                            </p>
                        )}
                    </div>

                    {/* Số người */}
                    <div>
                        <label className="block text-[var(--foreground)] text-sm font-medium mb-2">
                            Số người
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                            <Input
                                type="number"
                                {...register('passengers', {
                                    valueAsNumber: true,
                                    min: 1,
                                    max: 4,
                                })}
                                className="pl-10 h-11 rounded-lg border-[var(--border)] focus:ring-2 focus:ring-[var(--primary)] transition-all"
                            />
                        </div>
                        {errors.passengers && (
                            <p className="text-[var(--destructive)] text-xs mt-1.5 font-medium">
                                {errors.passengers.message}
                            </p>
                        )}
                    </div>

                    {/* Nút tìm chuyến */}
                    <div className="lg:pt-7 pt-0 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-end justify-center">
                            <button
                                type="submit"
                                className="bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-semibold px-8 py-3 rounded-lg shadow-md hover:opacity-90 transition-all w-full">
                                Tìm chuyến
                            </button>
                        </div>
                        {hasErrors && <div className="h-5"></div>}
                    </div>
                </div>
            </form>

            {/* Map container */}
            <div className="w-full max-w-6xl mt-6">
                <h2 className="text-[20px] font-semibold mb-0.5">
                    Map Section
                </h2>
                {userLocationContext && userLocationContext.userLocation ? (
                    <div className="w-full h-[400px] rounded-2xl border border-[var(--border)] shadow-xl overflow-hidden">
                        <Map
                            ref={mapRef}
                            mapboxAccessToken={MAPBOX_TOKEN}
                            initialViewState={{
                                longitude:
                                    userLocationContext.userLocation.lng ?? 0,
                                latitude:
                                    userLocationContext.userLocation.lat ?? 0,
                                zoom: 14,
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            mapStyle="mapbox://styles/mapbox/streets-v9">
                            {/* User location marker */}
                            <Marker
                                longitude={
                                    userLocationContext.userLocation.lng ?? 0
                                }
                                latitude={
                                    userLocationContext.userLocation.lat ?? 0
                                }
                                anchor="bottom">
                                <MapPin className="w-6 h-6 text-blue-500" />
                            </Marker>

                            {/* Pickup marker */}
                            {pickupCoords && (
                                <Marker
                                    longitude={pickupCoords.lng}
                                    latitude={pickupCoords.lat}
                                    anchor="bottom">
                                    <MapPin className="w-6 h-6 text-green-500" />
                                </Marker>
                            )}

                            {/* Dropoff marker */}
                            {dropoffCoords && (
                                <Marker
                                    longitude={dropoffCoords.lng}
                                    latitude={dropoffCoords.lat}
                                    anchor="bottom">
                                    <MapPin className="w-6 h-6 text-red-500" />
                                </Marker>
                            )}

                            {/* Route layer */}
                            {route && (
                                <Source id="route" type="geojson" data={route}>
                                    <Layer
                                        id="route"
                                        type="line"
                                        source="route"
                                        layout={{
                                            'line-join': 'round',
                                            'line-cap': 'round',
                                        }}
                                        paint={{
                                            'line-color': '#3b82f6',
                                            'line-width': 4,
                                        }}
                                    />
                                </Source>
                            )}
                        </Map>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
