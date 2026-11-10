import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useFieldTypes } from '../../features/fieldTypes/fieldTypes.hooks';
import { useFields } from '../../features/fields/fields.hooks';
import { useTimeSlots } from '../../features/timeSlots/timeSlots.hooks';
import { formatCurrency } from '../../utils/format';
import { todayDateInput } from '../../utils/date';
import '../../styles/pages/booking.css';

const emptyApplied = { keyword: '', fieldTypeId: '', bookingDate: '', timeSlotId: '' };

function buildFieldQueryFilters(applied) {
  const filters = {
    keyword: applied.keyword || undefined,
    fieldTypeId: applied.fieldTypeId || undefined,
  };
  if (applied.bookingDate && applied.timeSlotId) {
    filters.bookingDate = applied.bookingDate;
    filters.timeSlotId = Number(applied.timeSlotId);
  }
  return filters;
}

export default function SearchFieldsPage() {
  const fieldTypesQuery = useFieldTypes();
  const fieldTypes = fieldTypesQuery.data ?? [];

  const [keyword, setKeyword] = useState('');
  const [fieldTypeId, setFieldTypeId] = useState('');
  const [bookingDate, setBookingDate] = useState(todayDateInput());
  const [timeSlotId, setTimeSlotId] = useState('');
  const [applied, setApplied] = useState(emptyApplied);
  const [filterHint, setFilterHint] = useState('');

  const timeSlotsQuery = useTimeSlots(fieldTypeId || undefined);
  const timeSlots = timeSlotsQuery.data ?? [];

  const fieldsQuery = useFields(useMemo(() => buildFieldQueryFilters(applied), [applied]));

  const items = fieldsQuery.data?.items ?? [];

  const handleSearch = (e) => {
    e.preventDefault();
    setFilterHint('');
    const next = {
      keyword: keyword.trim(),
      fieldTypeId,
      bookingDate: bookingDate || '',
      timeSlotId,
    };
    if (next.bookingDate && !next.timeSlotId) {
      setFilterHint('Chọn loại sân và khung giờ khi lọc theo ngày chơi.');
      return;
    }
    setApplied(next);
  };

  const handleFieldTypeChange = (value) => {
    setFieldTypeId(value);
    setTimeSlotId('');
  };

  return (
    <div className="search-page">
      <div className="main_content">
        <div className="content-form">
          <div className="booking-form-card container p-4 p-md-5 mb-5">
            <h3 className="form-section-title mb-4">Tìm kiếm sân</h3>
            <form className="row g-3 mb-4" onSubmit={handleSearch}>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Từ khóa (tên sân)</label>
                <input
                  type="text"
                  className="form-control"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nhập tên sân..."
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Loại sân</label>
                <select
                  className="form-select"
                  value={fieldTypeId}
                  onChange={(e) => handleFieldTypeChange(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  {fieldTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Ngày chơi (tuỳ chọn)</label>
                <input
                  type="date"
                  className="form-control"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Khung giờ (khi lọc theo ngày)</label>
                <select
                  className="form-select"
                  value={timeSlotId}
                  onChange={(e) => setTimeSlotId(e.target.value)}
                  disabled={!fieldTypeId}
                >
                  <option value="">-- Chọn khung giờ --</option>
                  {timeSlots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.startTime} – {s.endTime}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="submit" className="btn-submit-booking w-100 py-2">
                  Tìm
                </button>
              </div>
            </form>
            {filterHint ? <p className="text-warning mb-3">{filterHint}</p> : null}

            {fieldsQuery.isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-warning" role="status" aria-label="Đang tải" />
              </div>
            ) : fieldsQuery.isError ? (
              <p className="text-danger">Không tải được danh sách sân.</p>
            ) : items.length === 0 ? (
              <p className="text-muted">Không tìm thấy sân phù hợp.</p>
            ) : (
              <div className="row g-3">
                {items.map((field) => (
                  <div key={field.id} className="col-12 col-md-6">
                    <div className="border rounded p-3 h-100 bg-white">
                      <h5 className="fw-bold">{field.name}</h5>
                      <p className="text-muted mb-1">{field.fieldTypeName}</p>
                      <p className="mb-2">{field.address}</p>
                      {field.priceFrom != null ? (
                        <p className="fw-semibold text-warning mb-2">Từ {formatCurrency(field.priceFrom)}</p>
                      ) : null}
                      <Link to={ROUTES.fieldDetail(field.id)} className="btn btn-sm btn-outline-secondary me-2">
                        Chi tiết
                      </Link>
                      <Link to={ROUTES.booking} className="btn btn-sm btn-warning">
                        Đặt sân
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
