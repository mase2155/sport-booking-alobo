const { addDays, today } = require('../../src/utils/datetime');
const { SLOT_STATE } = require('../../src/constants/field');

/**
 * Tìm (sân, khung giờ, ngày) còn Available — tránh fail test khi DB đã có đơn cũ.
 */
async function pickFreeBookableSlot(agent, { startDayOffset = 7, endDayOffset = 28 } = {}) {
  const fieldsRes = await agent.get('/api/v1/fields').query({ limit: 50, status: 'Active' });
  if (fieldsRes.status !== 200) return null;

  const fields = fieldsRes.body.data ?? [];
  if (!fields.length) return null;

  for (let dayOffset = startDayOffset; dayOffset <= endDayOffset; dayOffset += 1) {
    const bookingDate = addDays(today(), dayOffset);
    for (const field of fields) {
      const sched = await agent.get(`/api/v1/fields/${field.id}/schedule`).query({ date: bookingDate });
      if (sched.status !== 200) continue;

      const slots = sched.body.data?.slots ?? [];
      const available = slots.find((s) => s.state === SLOT_STATE.AVAILABLE && s.timeSlotId);
      if (available) {
        return {
          field,
          slot: { id: available.timeSlotId },
          bookingDate,
        };
      }
    }
  }

  return null;
}

module.exports = { pickFreeBookableSlot };
