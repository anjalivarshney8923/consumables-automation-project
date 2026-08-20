import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Calendar,
  Printer,
  Package,
  User,
  MapPin,
  Hash,
  Eye,
  Download,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  ClipboardEdit,
  Building,
  Mail,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutList,
  LayoutGrid,
  ShieldCheck,
  UserCheck,
  Send,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getUserUsageHistory,
  getUserUsageSummary,
  getUserUsageById
} from '../../services/assetUsageService';
import { getActiveCartridges } from '../../services/cartridgeService';
import { getAssets } from '../../services/assetService';

// Master Filter Options
const DEPARTMENT_OPTIONS = [
  'All Departments',
  'Operations',
  'Maintenance',
  'IT',
  'Administration',
  'Procurement',
  'Finance',
  'Stores',
  'Engineering',
  'Human Resources'
];

const COLOUR_OPTIONS = [
  'All Colours',
  'BLACK',
  'CYAN',
  'MAGENTA',
  'YELLOW'
];

const STATUS_OPTIONS = [
  'All Statuses',
  'Recorded',
  'Processed',
  'Cancelled'
];

export const AssetHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // View state: 'table' or 'cards'
  const [viewMode, setViewMode] = useState('table');

  // Search query & Debounce
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    cartridgeId: 'All Cartridges',
    colour: 'All Colours',
    printerId: 'All Printers',
    department: 'All Departments',
    status: 'All Statuses'
  });

  // Reference options loaded from backend
  const [cartridgeOptions, setCartridgeOptions] = useState([]);
  const [printerOptions, setPrinterOptions] = useState([]);

  // Sorting State
  const [sortField, setSortField] = useState('usageDate');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Record for Details Modal
  const [selectedUsage, setSelectedUsage] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Summary Metrics State (populated directly from PostgreSQL backend)
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalRecords: 0,
    totalQuantityUsed: 0,
    thisMonth: 0,
    lastUsage: '—'
  });

  // Dataset State (populated from real Spring Boot + PostgreSQL API)
  const [usageRecords, setUsageRecords] = useState([]);

  // Debounce search query changes by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Reference Cartridges and Printers for dropdown filters
  useEffect(() => {
    const loadFilterDropdowns = async () => {
      try {
        const [cartRes, assetRes] = await Promise.all([
          getActiveCartridges(),
          getAssets('', 'ACTIVE')
        ]);
        if (cartRes.success && Array.isArray(cartRes.data)) {
          setCartridgeOptions(cartRes.data);
        }
        if (assetRes.success && Array.isArray(assetRes.data)) {
          setPrinterOptions(assetRes.data);
        }
      } catch (err) {
        console.warn('Unable to load auxiliary filter dropdown options:', err);
      }
    };
    loadFilterDropdowns();
  }, []);

  // Fetch Summary Metrics from PostgreSQL
  const fetchSummary = useCallback(async () => {
    try {
      const res = await getUserUsageSummary();
      if (res.success && res.data) {
        setSummaryMetrics({
          totalRecords: res.data.totalRecords ?? 0,
          totalQuantityUsed: res.data.totalQuantityUsed ?? 0,
          thisMonth: res.data.thisMonthCount ?? 0,
          lastUsage: res.data.lastUsageDate || '—'
        });
      }
    } catch (err) {
      console.warn('Unable to fetch usage summary metrics:', err);
    }
  }, []);

  // Fetch Usage History from PostgreSQL
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage - 1, // Spring Boot is 0-indexed
        size: pageSize,
        search: debouncedSearch,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        cartridgeId: filters.cartridgeId !== 'All Cartridges' ? filters.cartridgeId : undefined,
        colour: filters.colour !== 'All Colours' ? filters.colour : undefined,
        printerId: filters.printerId !== 'All Printers' ? filters.printerId : undefined,
        department: filters.department !== 'All Departments' ? filters.department : undefined,
        status: filters.status !== 'All Statuses' ? filters.status : undefined,
        sortBy: sortField,
        sortDir: sortDirection
      };

      const res = await getUserUsageHistory(params);

      if (res.success) {
        if (res.data && Array.isArray(res.data.content)) {
          // Paginated response
          setUsageRecords(res.data.content);
          setTotalElements(res.data.totalElements || 0);
          setTotalPages(res.data.totalPages || 1);
        } else if (Array.isArray(res.data)) {
          // List response (fallback)
          setUsageRecords(res.data);
          setTotalElements(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
        } else {
          setUsageRecords([]);
          setTotalElements(0);
          setTotalPages(1);
        }
      } else {
        if (res.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (res.status === 403) {
          setError('You are not authorized to view these records.');
        } else {
          setError(res.message || 'Unable to load asset usage history. Please try again.');
        }
        setUsageRecords([]);
      }
    } catch (err) {
      setError('Unable to connect to backend server. Please verify Spring Boot is running.');
      setUsageRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, filters, sortField, sortDirection]);

  // Main data fetch trigger
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Summary fetch on mount
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedUsage) {
        setSelectedUsage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUsage]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Handle Filter Changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      cartridgeId: 'All Cartridges',
      colour: 'All Colours',
      printerId: 'All Printers',
      department: 'All Departments',
      status: 'All Statuses'
    });
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  // Active filter count badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    if (filters.cartridgeId !== 'All Cartridges') count++;
    if (filters.colour !== 'All Colours') count++;
    if (filters.printerId !== 'All Printers') count++;
    if (filters.department !== 'All Departments') count++;
    if (filters.status !== 'All Statuses') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);

  // Handle View Details with fresh backend fetch
  const handleViewDetails = async (item) => {
    setSelectedUsage(item);
    if (!item?.id) return;

    setIsLoadingDetails(true);
    try {
      const res = await getUserUsageById(item.id);
      if (res.success && res.data) {
        setSelectedUsage(res.data);
      }
    } catch (err) {
      console.warn('Error fetching detailed transaction:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    fetchHistory();
    fetchSummary();
  };

  // Status Badge Helper
  const renderStatusBadge = (status = 'Recorded') => {
    const s = (status || 'Recorded').toUpperCase();
    switch (s) {
      case 'PROCESSED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.6875rem',
              fontWeight: '700',
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE'
            }}
          >
            <CheckCircle2 size={11} />
            <span>Processed</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.6875rem',
              fontWeight: '700',
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FECACA'
            }}
          >
            <XCircle size={11} />
            <span>Cancelled</span>
          </span>
        );
      case 'RECORDED':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.6875rem',
              fontWeight: '700',
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: '#F0FDF4',
              color: '#166534',
              border: '1px solid #BBF7D0'
            }}
          >
            <CheckCircle2 size={11} />
            <span>Recorded</span>
          </span>
        );
    }
  };

  // Colour Badge Helper
  const renderColourBadge = (colour) => {
    if (!colour) {
      return <span style={{ color: '#94A3B8' }}>—</span>;
    }
    const c = colour.toUpperCase();
    const config = {
      BLACK: { bg: '#F1F5F9', color: '#0F172A', border: '#CBD5E1' },
      CYAN: { bg: '#ECFEFF', color: '#0891B2', border: '#A5F3FC' },
      MAGENTA: { bg: '#FDF4FF', color: '#C026D3', border: '#F5D0FE' },
      YELLOW: { bg: '#FEFCE8', color: '#CA8A04', border: '#FEF08A' }
    }[c] || { bg: '#F1F5F9', color: '#334155', border: '#E2E8F0' };

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.6875rem',
          fontWeight: '700',
          padding: '0.15rem 0.45rem',
          borderRadius: '4px',
          backgroundColor: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: config.color
          }}
        />
        {c}
      </span>
    );
  };

  // Sort indicator helper
  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} color="#94A3B8" style={{ marginLeft: '0.25rem' }} />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp size={12} color="var(--iocl-navy)" style={{ marginLeft: '0.25rem' }} />
      : <ArrowDown size={12} color="var(--iocl-navy)" style={{ marginLeft: '0.25rem' }} />;
  };

  return (
    <div className="procurement-page-container">
      {/* 1. Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <h1 className="page-title-text" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--iocl-navy)' }}>
              ASSET USAGE HISTORY
            </h1>
            <span
              style={{
                fontSize: '0.6875rem',
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                fontWeight: '800',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #BFDBFE',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              TRANSACTION LOGS
            </span>
          </div>
          <p className="page-subtitle-text" style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            View and track all consumable usage records. Review previously recorded cartridge and consumable usage with complete transaction details.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{
              padding: '0.5rem 0.875rem',
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              cursor: 'pointer'
            }}
            title="Refresh history records"
          >
            <RefreshCw size={14} className={isLoading ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>

          {/* Record Asset Usage Navigation */}
          <Link
            to="/user/usage"
            className="btn btn-primary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8125rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              textDecoration: 'none',
              backgroundColor: 'var(--iocl-navy)',
              color: '#FFFFFF',
              borderRadius: '8px'
            }}
          >
            <ClipboardEdit size={15} />
            <span>Record Asset Usage</span>
          </Link>
        </div>
      </header>

      {/* 2. Top Summary Metric Cards (Real PostgreSQL Data) */}
      <section
        aria-label="Usage Summary Metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Card 1: Total Usage Records */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TOTAL USAGE RECORDS
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--iocl-navy)', marginTop: '0.25rem' }}>
              {summaryMetrics.totalRecords}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
              All recorded transactions
            </span>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <History size={22} />
          </div>
        </div>

        {/* Card 2: Total Quantity Used */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TOTAL QUANTITY USED
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#D4001F', marginTop: '0.25rem' }}>
              {summaryMetrics.totalQuantityUsed}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
              Consumable units recorded
            </span>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Package size={22} />
          </div>
        </div>

        {/* Card 3: This Month */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              THIS MONTH
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', marginTop: '0.25rem' }}>
              {summaryMetrics.thisMonth}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
              Current calendar month
            </span>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#F0FDF4',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Calendar size={22} />
          </div>
        </div>

        {/* Card 4: Last Usage */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              LAST USAGE
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--iocl-navy)', marginTop: '0.4rem' }}>
              {summaryMetrics.lastUsage}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
              Most recent entry
            </span>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#FFFBEB',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Clock size={22} />
          </div>
        </div>
      </section>

      {/* 3. Error Banner */}
      {error && (
        <div
          className="mb-6"
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#991B1B' }}>
            <AlertCircle size={18} color="#DC2626" />
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            style={{
              padding: '0.3rem 0.75rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #FCA5A5',
              borderRadius: '6px',
              color: '#991B1B',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* 4. Controls Bar: Search & Filter Toggles & View Mode */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1rem 1.25rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={16}
              color="#94A3B8"
              style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search asset usage by employee, cartridge, printer, cabin, or work order..."
              style={{
                width: '100%',
                padding: '0.625rem 2.25rem 0.625rem 2.375rem',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#1E293B',
                backgroundColor: '#FFFFFF'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedSearch('');
                  setCurrentPage(1);
                }}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 0
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Toggle & View Mode Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Filter Panel Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.625rem 0.875rem',
                backgroundColor: showFilters ? '#EFF6FF' : '#FFFFFF',
                border: showFilters ? '1px solid #BFDBFE' : '1px solid #CBD5E1',
                color: showFilters ? '#1E40AF' : '#334155',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--iocl-navy)',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    fontSize: '0.6875rem',
                    padding: '0.05rem 0.4rem',
                    fontWeight: '800'
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Clear Filters (if active) */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.625rem 0.75rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#DC2626',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                title="Clear all filters"
              >
                <X size={14} />
                <span>Reset</span>
              </button>
            )}

            {/* View Mode Switcher (Desktop/Tablet) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F1F5F9',
                borderRadius: '8px',
                padding: '0.2rem'
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '0.4rem 0.6rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'table' ? 'var(--iocl-navy)' : '#64748B',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}
                title="Table View"
              >
                <LayoutList size={14} />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                style={{
                  padding: '0.4rem 0.6rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'cards' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'cards' ? 'var(--iocl-navy)' : '#64748B',
                  boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}
                title="Card View"
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Filter Panel */}
        {showFilters && (
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid #F1F5F9',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}
          >
            {/* From Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
                From Date
              </label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: '#1E293B'
                }}
              />
            </div>

            {/* To Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
                To Date
              </label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: '#1E293B'
                }}
              />
            </div>

            {/* Cartridge Filter (Dynamic from Master Data) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
                Cartridge
              </label>
              <select
                value={filters.cartridgeId}
                onChange={(e) => handleFilterChange('cartridgeId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="All Cartridges">All Cartridges</option>
                {cartridgeOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.partNumber} — {c.cartridgeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Printer Filter (Dynamic from Master Data) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
                Printer
              </label>
              <select
                value={filters.printerId}
                onChange={(e) => handleFilterChange('printerId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value="All Printers">All Printers</option>
                {printerOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.modelName} ({p.serialNumber || p.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {DEPARTMENT_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Colour Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
                Colour
              </label>
              <select
                value={filters.colour}
                onChange={(e) => handleFilterChange('colour', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {COLOUR_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.375rem' }}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 5. Main History Records Container */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}
      >
        {/* Table Header Bar */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="var(--iocl-navy)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--iocl-navy)', margin: 0 }}>
              Consumable Usage History
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748B',
                backgroundColor: '#F1F5F9',
                padding: '0.25rem 0.625rem',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontWeight: '600'
              }}
            >
              Showing <strong>{usageRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalElements)}</strong> of <strong>{totalElements}</strong> records
            </span>
          </div>
        </div>

        {/* Render: Loading State / Empty State / Table View / Card View */}
        {isLoading ? (
          /* Loading State Skeleton */
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={28} className="spinner text-navy" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
              Loading asset usage history...
            </p>
            <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
              Fetching transaction records from PostgreSQL
            </span>
          </div>
        ) : usageRecords.length === 0 ? (
          /* Professional Empty State */
          <div
            style={{
              padding: '5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <History size={36} color="var(--iocl-navy)" />
            </div>

            <h4 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#1E293B', margin: '0 0 0.5rem' }}>
              No Asset Usage Records
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              There are no asset usage transactions to display. When you record cartridge or consumable consumption, your transaction history will appear here.
            </p>

            <Link
              to="/user/usage"
              className="btn btn-primary"
              style={{
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--iocl-navy)',
                color: '#FFFFFF',
                borderRadius: '8px',
                textDecoration: 'none'
              }}
            >
              <ClipboardEdit size={16} />
              <span>Record Asset Usage</span>
            </Link>
          </div>
        ) : viewMode === 'table' ? (
          /* Desktop & Tablet Table View */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  {/* Date */}
                  <th
                    onClick={() => handleSort('usageDate')}
                    style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span>DATE</span>
                      {renderSortIndicator('usageDate')}
                    </div>
                  </th>

                  {/* RECORDED BY (ENGINEER) */}
                  <th style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)' }}>
                    RECORDED BY
                  </th>

                  {/* BENEFICIARY */}
                  <th
                    onClick={() => handleSort('beneficiaryEmployeeName')}
                    style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span>BENEFICIARY</span>
                      {renderSortIndicator('beneficiaryEmployeeName')}
                    </div>
                  </th>

                  {/* EMP NO. */}
                  <th style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)' }}>
                    EMP NO.
                  </th>

                  {/* CABIN / SEAT */}
                  <th style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)' }}>
                    CABIN / SEAT
                  </th>

                  {/* PRINTER */}
                  <th style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)' }}>
                    PRINTER
                  </th>

                  {/* CARTRIDGE */}
                  <th
                    onClick={() => handleSort('partNumber')}
                    style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span>CARTRIDGE</span>
                      {renderSortIndicator('partNumber')}
                    </div>
                  </th>

                  {/* COLOUR */}
                  <th style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)' }}>
                    COLOUR
                  </th>

                  {/* QTY */}
                  <th
                    onClick={() => handleSort('quantityUsed')}
                    style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <span>QTY</span>
                      {renderSortIndicator('quantityUsed')}
                    </div>
                  </th>

                  {/* REFERENCE */}
                  <th style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)' }}>
                    REFERENCE
                  </th>

                  {/* STATUS */}
                  <th style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)', textAlign: 'center' }}>
                    STATUS
                  </th>

                  {/* ACTION */}
                  <th style={{ padding: '0.875rem 1rem', fontWeight: '800', color: 'var(--iocl-navy)', textAlign: 'center' }}>
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody>
                {usageRecords.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid #E2E8F0', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                  >
                    {/* Usage Date */}
                    <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: '#1E293B', whiteSpace: 'nowrap' }}>
                      {item.usageDate}
                    </td>

                    {/* RECORDED BY (Authenticated Engineer) */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: 'var(--iocl-navy)' }}>
                        {item.recordedByEmployeeName || user?.fullName || 'Engineer'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                        ID: {item.recordedByEmployeeNo || user?.employeeId || '—'}
                      </div>
                    </td>

                    {/* USAGE BENEFICIARY (Target Employee) */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#1E293B' }}>
                        {item.beneficiaryEmployeeName || item.employeeName}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                        {item.beneficiaryDepartment || item.department}
                      </div>
                    </td>

                    {/* Beneficiary Employee No. */}
                    <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: '600', color: '#475569' }}>
                      {item.beneficiaryEmployeeNo || item.employeeNo}
                    </td>

                    {/* Cabin / Seat */}
                    <td style={{ padding: '0.875rem 1rem', color: '#334155' }}>
                      <div style={{ fontWeight: '600' }}>{item.beneficiarySeatOrCabinNo || item.seatOrCabinNo || '—'}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{item.beneficiaryLocation || item.location}</div>
                    </td>

                    {/* Printer */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: '600', color: '#1E293B' }}>{item.printerModel || 'Printer'}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{item.printerType || 'B&W'}</div>
                    </td>

                    {/* Cartridge */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: 'var(--iocl-navy)' }}>{item.partNumber || item.cartridgeName}</div>
                      {item.cartridgeName && item.cartridgeName !== item.partNumber && (
                        <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{item.cartridgeName}</div>
                      )}
                    </td>

                    {/* Colour */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {renderColourBadge(item.colour)}
                    </td>

                    {/* Quantity */}
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: '800', color: '#D4001F' }}>
                      {item.quantityUsed}
                    </td>

                    {/* Reference / Work Order */}
                    <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569' }}>
                      {item.workOrderReference || '—'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                      {renderStatusBadge(item.status)}
                    </td>

                    {/* Action: View Details */}
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleViewDetails(item)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          borderRadius: '6px',
                          color: '#1E40AF',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        title="View complete transaction details"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Mobile / Card View */
          <div
            style={{
              padding: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}
          >
            {usageRecords.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  padding: '1.25rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                {/* Card Top: Date & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#1E293B', fontWeight: '800', fontSize: '0.875rem' }}>
                    <Calendar size={14} color="var(--iocl-navy)" />
                    <span>{item.usageDate}</span>
                  </div>
                  {renderStatusBadge(item.status)}
                </div>

                {/* Cartridge & Quantity */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--iocl-navy)' }}>
                      {item.partNumber || item.cartridgeName}
                    </div>
                    {item.colour && <div style={{ marginTop: '0.15rem' }}>{renderColourBadge(item.colour)}</div>}
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: '#D4001F' }}>
                    Qty: {item.quantityUsed}
                  </span>
                </div>

                {/* Identity Separation: Recorded By & Beneficiary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>Usage For:</span>
                    <span style={{ fontWeight: '700', color: '#1E293B' }}>{item.beneficiaryEmployeeName} ({item.beneficiarySeatOrCabinNo || '—'})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>Recorded By:</span>
                    <span style={{ fontWeight: '600', color: 'var(--iocl-navy)' }}>{item.recordedByEmployeeName || user?.fullName || 'Engineer'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>Printer:</span>
                    <span style={{ color: '#334155' }}>{item.printerModel}</span>
                  </div>
                </div>

                {/* Card Action Button */}
                <button
                  type="button"
                  onClick={() => handleViewDetails(item)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    color: '#1E40AF',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    marginTop: '0.25rem'
                  }}
                >
                  <Eye size={14} />
                  <span>View Details</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalElements > 0 && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            {/* Page size dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748B' }}>
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Prev / Next Pagination Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.375rem 0.75rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: currentPage === 1 ? '#94A3B8' : '#1E293B',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', padding: '0 0.5rem' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.375rem 0.75rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: currentPage === totalPages ? '#94A3B8' : '#1E293B',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          6. ASSET USAGE DETAILS MODAL / DRAWER
          ============================================================ */}
      {selectedUsage && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedUsage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E2E8F0',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <FileText size={20} color="var(--iocl-navy)" />
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--iocl-navy)', margin: 0 }}>
                    ASSET USAGE DETAILS
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Transaction ID: <strong>#{selectedUsage.id || 'TXN-PENDING'}</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {renderStatusBadge(selectedUsage.status)}
                <button
                  type="button"
                  onClick={() => setSelectedUsage(null)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.375rem',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Organized Sections */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Section 1: RECORDED BY (Engineer) */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem', color: 'var(--iocl-navy)', fontWeight: '800', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <UserCheck size={16} />
                  <span>1. RECORDED BY (ENGINEER)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Engineer Name:</span>
                    <strong style={{ color: '#1E293B' }}>{selectedUsage.recordedByEmployeeName || user?.fullName || 'Engineer'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Engineer Employee No:</span>
                    <strong style={{ color: '#1E293B', fontFamily: 'monospace' }}>{selectedUsage.recordedByEmployeeNo || user?.employeeId || '—'}</strong>
                  </div>
                </div>
              </div>

              {/* Section 2: USAGE BENEFICIARY (Target Employee & Location) */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem', color: 'var(--iocl-navy)', fontWeight: '800', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <User size={16} />
                  <span>2. USAGE BENEFICIARY (CONSUMER)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Beneficiary Employee Name:</span>
                    <strong style={{ color: '#1E293B' }}>{selectedUsage.beneficiaryEmployeeName || selectedUsage.employeeName || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Beneficiary Employee No:</span>
                    <strong style={{ color: '#1E293B', fontFamily: 'monospace' }}>{selectedUsage.beneficiaryEmployeeNo || selectedUsage.employeeNo || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Department:</span>
                    <strong style={{ color: '#1E293B' }}>{selectedUsage.beneficiaryDepartment || selectedUsage.department || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Office Location:</span>
                    <strong style={{ color: '#1E293B' }}>{selectedUsage.beneficiaryLocation || selectedUsage.location || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Seat / Cabin No:</span>
                    <strong style={{ color: '#1E293B' }}>{selectedUsage.beneficiarySeatOrCabinNo || selectedUsage.seatOrCabinNo || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Beneficiary Email:</span>
                    <strong style={{ color: '#0284C7' }}>{selectedUsage.beneficiaryEmail || 'Not available'}</strong>
                  </div>
                </div>
              </div>

              {/* Section 3: ASSET & CONSUMABLE DETAILS */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem', color: 'var(--iocl-navy)', fontWeight: '800', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Printer size={16} />
                  <span>3. ASSET & CONSUMABLE DETAILS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Printer Model:</span>
                    <strong style={{ color: '#1E293B' }}>{selectedUsage.printerModel || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Printer Type:</span>
                    <strong style={{ color: '#1E293B' }}>{selectedUsage.printerType || 'Black & White'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Cartridge Part No:</span>
                    <strong style={{ color: 'var(--iocl-navy)' }}>{selectedUsage.partNumber || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Cartridge Description:</span>
                    <strong style={{ color: '#1E293B' }}>{selectedUsage.cartridgeName || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Colour:</span>
                    <div style={{ marginTop: '0.2rem' }}>{renderColourBadge(selectedUsage.colour)}</div>
                  </div>
                </div>
              </div>

              {/* Section 4: USAGE TRANSACTION DETAILS */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem', color: 'var(--iocl-navy)', fontWeight: '800', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Package size={16} />
                  <span>4. USAGE DETAILS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Quantity Used:</span>
                    <strong style={{ fontSize: '1.125rem', color: '#D4001F' }}>{selectedUsage.quantityUsed} unit(s)</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Usage Date:</span>
                    <strong style={{ color: '#1E293B' }}>{selectedUsage.usageDate}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Work Order / Reference:</span>
                    <strong style={{ color: '#1E293B', fontFamily: 'monospace' }}>{selectedUsage.workOrderReference || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Remarks:</span>
                    <span style={{ color: '#334155' }}>{selectedUsage.remarks || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Section 5: NOTIFICATION STATUS */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem', color: 'var(--iocl-navy)', fontWeight: '800', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Send size={16} />
                  <span>5. BENEFICIARY NOTIFICATION</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Notification Recipient:</span>
                    <strong style={{ color: '#0284C7' }}>{selectedUsage.beneficiaryEmail || 'Not available'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Email Status:</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.6875rem',
                        fontWeight: '700',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: selectedUsage.emailNotificationSent === false ? '#FEF2F2' : '#F0FDF4',
                        color: selectedUsage.emailNotificationSent === false ? '#991B1B' : '#166534',
                        border: selectedUsage.emailNotificationSent === false ? '1px solid #FECACA' : '1px solid #BBF7D0',
                        marginTop: '0.15rem'
                      }}
                    >
                      <CheckCircle2 size={11} />
                      <span>{selectedUsage.emailNotificationSent === false ? 'Failed / Disabled' : selectedUsage.emailNotificationSent === true ? 'Sent' : 'Recorded'}</span>
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedUsage(null)}
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: 'var(--iocl-navy)',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
