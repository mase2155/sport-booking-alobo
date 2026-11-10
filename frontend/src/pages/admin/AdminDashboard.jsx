import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../constants/routes';
import { queryKeys } from '../../constants/queryKeys';
import { fetchNewsPostsApi } from '../../features/newsPosts/newsPosts.api';
import { fetchPartnerItemsApi } from '../../features/partnerItems/partnerItems.api';
import {
  fetchStatsFieldsApi,
  fetchStatsOverviewApi,
  fetchStatsRevenueApi,
} from '../../features/stats/stats.api';
import { formatCurrency, formatDate } from '../../utils/format';
import { todayDateInput } from '../../utils/date';

const base = ROUTES.admin;

export default function AdminDashboard() {
  const [reportDate, setReportDate] = useState(todayDateInput());
  const [appliedDate, setAppliedDate] = useState(todayDateInput());

  const { data: newsMeta } = useQuery({
    queryKey: queryKeys.newsPosts({ admin: true }),
    queryFn: () => fetchNewsPostsApi({ limit: 1 }),
  });
  const { data: partnersMeta } = useQuery({
    queryKey: queryKeys.partnerItems({ admin: true }),
    queryFn: () => fetchPartnerItemsApi({ limit: 1 }),
  });
  const { data: overview, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.adminStatsOverview,
    queryFn: fetchStatsOverviewApi,
  });

  const revenueQuery = useQuery({
    queryKey: queryKeys.adminStatsRevenue({ date: appliedDate }),
    queryFn: () =>
      fetchStatsRevenueApi({
        groupBy: 'day',
        fromDate: appliedDate,
        toDate: appliedDate,
      }),
  });

  const fieldsStatsQuery = useQuery({
    queryKey: queryKeys.adminStatsFields,
    queryFn: fetchStatsFieldsApi,
  });

  const applyRevenueFilter = (e) => {
    e.preventDefault();
    setAppliedDate(reportDate);
  };

  const revenuePoints = revenueQuery.data ?? [];
  const fieldStats = fieldsStatsQuery.data ?? [];

  const periodTotals = useMemo(() => {
    let paidBookings = 0;
    let revenue = 0;
    for (const row of revenuePoints) {
      paidBookings += row.paidBookings ?? 0;
      revenue += row.revenue ?? 0;
    }
    return { paidBookings, revenue };
  }, [revenuePoints]);

  return (
    <>
      <div className="content-header">
        <h1>Báo cáo hệ thống</h1>
        <p className="breadcrumb-demo">Admin / Báo cáo hệ thống</p>
      </div>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card stat-box">
            <div className="card-body">
              <h6 className="text-muted">Bài tin tức</h6>
              <h3 className="mb-0">{newsMeta?.meta?.total ?? '—'}</h3>
              <Link to={`${base}/content/news`} className="small">
                Quản lý tin tức →
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-box">
            <div className="card-body">
              <h6 className="text-muted">Đối tác</h6>
              <h3 className="mb-0">{partnersMeta?.meta?.total ?? '—'}</h3>
              <Link to={`${base}/content/partners`} className="small">
                Quản lý đối tác →
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-box">
            <div className="card-body">
              <h6 className="text-muted">Đơn chờ xử lý</h6>
              <h3 className="mb-0">{statsLoading ? '…' : (overview?.pendingBookings ?? 0)}</h3>
              <Link to={`${base}/operations/bookings`} className="small">
                Xem đơn đặt lịch →
              </Link>
            </div>
          </div>
        </div>
      </div>
      {!statsLoading && overview && (
        <div className="card mt-2">
          <div className="card-header">Thống kê số lượng đơn</div>
          <div className="card-body row g-3">
            <div className="col-sm-4">
              <strong>Tổng đơn (không hủy):</strong> {overview.totalBookings}
            </div>
            <div className="col-sm-4">
              <strong>Đã hủy:</strong> {overview.cancelledBookings}
            </div>
            <div className="col-sm-4">
              <strong>Doanh thu đã thu (tổng):</strong> {formatCurrency(overview.totalRevenue ?? 0)}
            </div>
          </div>
        </div>
      )}

      <div className="card mt-3">
        <div className="card-header">Doanh thu theo ngày</div>
        <div className="card-body">
          <form className="row g-2 align-items-end mb-3" onSubmit={applyRevenueFilter}>
            <div className="col-md-4">
              <label className="form-label small">Ngày</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-sm btn-primary w-100">
                Áp dụng
              </button>
            </div>
          </form>
          {revenueQuery.isLoading && <p className="text-muted mb-0">Đang tải doanh thu…</p>}
          {revenueQuery.isError && <p className="text-danger mb-0">Không tải được dữ liệu doanh thu.</p>}
          {!revenueQuery.isLoading && !revenueQuery.isError && (
            <div className="row g-3">
              <div className="col-md-6">
                <div className="border rounded p-3 bg-light">
                  <div className="small text-muted">Số đơn xử lý (đã thu ngày {formatDate(appliedDate)})</div>
                  <div className="fs-4 fw-semibold mb-0">{periodTotals.paidBookings}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded p-3 bg-light">
                  <div className="small text-muted">Tổng doanh thu (ngày {formatDate(appliedDate)})</div>
                  <div className="fs-4 fw-semibold mb-0">{formatCurrency(periodTotals.revenue)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-header">Hiệu suất từng sân</div>
        <div className="card-body table-responsive">
          {fieldsStatsQuery.isLoading && <p className="text-muted mb-0">Đang tải…</p>}
          {fieldsStatsQuery.isError && <p className="text-danger mb-0">Không tải được thống kê sân.</p>}
          {!fieldsStatsQuery.isLoading && !fieldsStatsQuery.isError && fieldStats.length === 0 && (
            <p className="text-muted mb-0">Chưa có dữ liệu đặt sân.</p>
          )}
          {fieldStats.length > 0 && (
            <table className="table table-sm table-hover mb-0">
              <thead>
                <tr>
                  <th>Sân</th>
                  <th>Số đơn</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {fieldStats.map((row) => (
                  <tr key={row.fieldId}>
                    <td>{row.fieldName}</td>
                    <td>{row.bookingCount}</td>
                    <td>{formatCurrency(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
