
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { JobStatus } from '../types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Home, Users, BarChart3, MessageCircle, Settings, Search, Bell } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, eachWeekOfInterval, addMonths, subMonths, isToday, isSameMonth, parseISO, addDays } from 'date-fns';

const CalendarScreen: React.FC = () => {
    const { state, navigateTo } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
    const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());

    // Week view calculations
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Mini calendar calculations
    const miniMonthStart = startOfMonth(miniCalendarDate);
    const miniMonthEnd = endOfMonth(miniCalendarDate);
    const miniMonthDays = eachDayOfInterval({ start: miniMonthStart, end: miniMonthEnd });

    // Get first day of month to calculate offset
    const firstDayOfMonth = miniMonthStart.getDay();
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday = 0

    // Time slots for week view (8 AM to 6 PM)
    const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8); // 8-18 (6 PM)

    // Filter jobs for current week
    const weekJobs = state.jobs.filter(job => {
        if (job.status === JobStatus.CANCELED) return false;
        const jobStart = parseISO(job.startDate);
        const jobEnd = parseISO(job.endDate);
        return jobEnd >= weekStart && jobStart <= weekEnd;
    });

    // Get jobs for a specific day and time slot
    const getJobsForSlot = (day: Date, hour: number) => {
        return weekJobs.filter(job => {
            const jobStart = parseISO(job.startDate);
            const jobEnd = parseISO(job.endDate);
            return isSameDay(day, jobStart) || isSameDay(day, jobEnd) || (day >= jobStart && day <= jobEnd);
        });
    };

    const getJobColor = (status: JobStatus) => {
        switch (status) {
            case JobStatus.IN_PROGRESS: return 'bg-emerald-500 border-emerald-600 text-white';
            case JobStatus.UPCOMING: return 'bg-blue-500 border-blue-600 text-white';
            case JobStatus.WRAPPED: return 'bg-slate-400 border-slate-500 text-white';
            default: return 'bg-slate-300 border-slate-400 text-slate-900';
        }
    };

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const nextMiniMonth = () => setMiniCalendarDate(addMonths(miniCalendarDate, 1));
    const prevMiniMonth = () => setMiniCalendarDate(subMonths(miniCalendarDate, 1));

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 -m-8 overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-96 bg-slate-100 dark:bg-slate-800 p-6 flex flex-col gap-6 overflow-y-auto border-r border-slate-200 dark:border-slate-700">
                {/* Mini Calendar */}
                <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{format(miniCalendarDate, 'MMMM yyyy')}</h3>
                        <div className="flex gap-1">
                            <button onClick={prevMiniMonth} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={nextMiniMonth} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Mini Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                            <div key={i} className="text-slate-500 dark:text-slate-400 font-semibold py-1">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {Array.from({ length: offset }).map((_, i) => (
                            <div key={`offset-${i}`} className="py-2"></div>
                        ))}
                        {miniMonthDays.map((day, i) => {
                            const isCurrentDay = isToday(day);
                            const isSelected = isSameDay(day, currentDate);
                            const hasJobs = weekJobs.some(job => {
                                const jobStart = parseISO(job.startDate);
                                const jobEnd = parseISO(job.endDate);
                                return day >= jobStart && day <= jobEnd;
                            });

                            return (
                                <button
                                    key={i}
                                    onClick={() => setCurrentDate(day)}
                                    className={`py-2 rounded-lg font-medium transition-all relative ${
                                        isCurrentDay
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold ring-2 ring-emerald-500'
                                            : isSelected
                                            ? 'bg-emerald-600 text-white'
                                            : isSameMonth(day, miniCalendarDate)
                                            ? 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                                            : 'text-slate-400 dark:text-slate-600'
                                    }`}
                                >
                                    {format(day, 'd')}
                                    {hasJobs && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upcoming events today</h3>
                        <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold">View all</button>
                    </div>
                    <div className="space-y-3">
                        {weekJobs.slice(0, 4).map((job, i) => {
                            const producer = state.users.find(u => u.id === job.producerId);
                            return (
                                <div
                                    key={i}
                                    onClick={() => navigateTo('JOB_DETAIL', { jobId: job.id })}
                                    className="flex items-center gap-3 cursor-pointer hover:bg-white dark:hover:bg-slate-700 p-3 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                >
                                    <div className={`w-2 h-2 rounded-full ${job.status === JobStatus.IN_PROGRESS ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm truncate text-slate-900 dark:text-white">{job.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {format(parseISO(job.startDate), 'HH:mm')} - {format(parseISO(job.endDate), 'HH:mm')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Time Breakdown */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Time breakdown</h3>
                        <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold">View all</button>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-300">Active Jobs</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-300">Completed</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600 dark:text-slate-300">Equipment Out</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Calendar</h1>
                        <div className="flex items-center gap-4">
                            <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <Search size={20} className="text-slate-600 dark:text-slate-400" />
                            </button>
                            <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <Bell size={20} className="text-slate-600 dark:text-slate-400" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold cursor-pointer">
                                {state.currentUser?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {format(currentDate, 'MMMM yyyy')}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button onClick={prevWeek} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                                </button>
                                <button onClick={nextWeek} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                                <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`} onClick={() => setViewMode('month')}>Month</button>
                                <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`} onClick={() => setViewMode('week')}>Week</button>
                                <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'day' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`} onClick={() => setViewMode('day')}>Day</button>
                            </div>
                            <button
                                onClick={() => navigateTo('ADD_JOB')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
                            >
                                <Plus size={20} /> Add Job
                            </button>
                        </div>
                    </div>
                </div>

                {/* Week View */}
                <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-6">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Week Days Header */}
                        <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700">
                            <div className="p-4 text-sm font-semibold text-slate-500 dark:text-slate-400">GMT +4</div>
                            {weekDays.map((day, i) => {
                                const isCurrentDay = isToday(day);
                                return (
                                    <div key={i} className={`p-4 text-center border-l border-slate-200 dark:border-slate-700 ${isCurrentDay ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{format(day, 'EEE')} {format(day, 'd')}</div>
                                        {isCurrentDay && <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Today</div>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Time Slots */}
                        <div className="overflow-y-auto max-h-[600px]">
                            {timeSlots.map((hour) => (
                                <div key={hour} className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="p-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        {format(new Date().setHours(hour, 0), 'h:00 a')}
                                    </div>
                                    {weekDays.map((day, dayIndex) => {
                                        const jobs = getJobsForSlot(day, hour);
                                        const isCurrentDay = isToday(day);

                                        return (
                                            <div
                                                key={dayIndex}
                                                className={`p-2 min-h-[80px] border-l border-slate-100 dark:border-slate-700/50 relative ${isCurrentDay ? 'bg-emerald-50/30 dark:bg-emerald-900/5' : ''}`}
                                            >
                                                {jobs.map((job, jobIndex) => {
                                                    const producer = state.users.find(u => u.id === job.producerId);
                                                    return (
                                                        <div
                                                            key={jobIndex}
                                                            onClick={() => navigateTo('JOB_DETAIL', { jobId: job.id })}
                                                            className={`p-2 rounded-xl cursor-pointer hover:shadow-lg transition-all mb-2 ${getJobColor(job.status)}`}
                                                        >
                                                            <div className="font-bold text-xs mb-0.5">{job.name}</div>
                                                            <div className="text-[10px] opacity-90">
                                                                {format(parseISO(job.startDate), 'HH:mm')} - {format(parseISO(job.endDate), 'HH:mm')}
                                                            </div>
                                                            {producer && (
                                                                <div className="flex gap-1 mt-1">
                                                                    <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[8px] font-bold">
                                                                        {producer.name.charAt(0)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarScreen;
