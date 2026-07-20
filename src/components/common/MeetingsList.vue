<template>
  <div class="meetings-card">
    <div class="meetings-header">
      <h3 class="card-title">My Meetings</h3>
      <div class="actionMeet">
        <div class="meetings-cle"><img src="../../assets/images/calendar-2-line.svg" alt="" /></div>
        <div class="meetings-add"><i>+</i></div>
      </div>
    </div>

    <div v-for="group in meetingGroups" :key="group.date" class="meeting-group">
      <div class="group-date">{{ group.date }}</div>
      <div v-for="meeting in group.meetings" :key="meeting.title" class="meeting-row">
        <div class="meeting-info">
          <span class="meeting-title">{{ meeting.title }}</span>
          <span class="meeting-sub" :class="{ 'meeting-sub--new': meeting.sub === 'New meeting' }">
            {{ meeting.sub }}
          </span>
        </div>
        <span class="meeting-time">{{ meeting.time }}</span>
      </div>
    </div>
  </div>
  <ScheduleMeeting v-model="showScheduleDialog" />
</template>

<script setup>
import { ref } from 'vue'
import ScheduleMeeting from './ScheduleMeetingDialog.vue'

const showScheduleDialog = ref(false)
const meetingGroups = [
  {
    date: 'Today — Jan 3, 2026',
    meetings: [
      { title: 'Follow-up – Arjun Mehta', sub: 'Last met 3 days ago', time: '10:00 am' },
      { title: 'New Client Consultation – Prija K.', sub: 'New meeting', time: '11:00 am' },
      { title: 'Follow-up – Ramesh K.', sub: 'Last met 1 week ago', time: '4:30 pm' },
      { title: 'Workshop: Healthy Eating for Work...', sub: 'Workshop', time: '6:30 pm' },
    ],
  },
  {
    date: 'Tomorrow — Jan 4, 2026',
    meetings: [{ title: 'Consultation – Sneha P.', sub: 'Last met 3 days ago', time: '9:00 am' }],
  },
]
</script>

<style scoped>
.meetings-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
}

.meetings-card .meetings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.meetings-card .card-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.15px;
  color: #272727;
  margin: 0;
}
.meetings-card .actionMeet {
  display: flex;
}
.meetings-card .actionMeet .meetings-cle {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #f7c6ff, #ffd6a5) border-box;
  border: 2px solid transparent;
  box-shadow: 0 2px 0 0 #d7c8e2;
  cursor: pointer;
  width: 44px;
  height: 40px;
  border-radius: 50%;
}
.meetings-card .meetings-add {
  margin-left: 8px;
  width: 70px;
  height: 40px;
  border-radius: 50px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #f7c6ff, #ffd6a5) border-box;
  border: 2px solid transparent;
  box-shadow: 0 2px 0 0 #d7c8e2;
  cursor: pointer;
}

.meetings-card .meetings-add::before {
  content: '';
  position: absolute;
  background: #f4e3f1;
  width: 100%;
  height: 100%;
  z-index: 0;
  top: 0;
  left: 0;
}
.meetings-card .meetings-add i {
  position: relative;
  z-index: 1;
  color: #ab2e95;
  font-style: normal;
  font-size: 26px;
  font-weight: 700;
}

.meetings-card .meeting-group {
  margin-bottom: 10px;
}

.meetings-card .meeting-group .group-date {
  color: #6d6d6d;

  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
}

.meetings-card .meeting-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 16px 0;
  border-bottom: 1px solid #ebecef;

  cursor: pointer;
}

.meetings-card .meeting-row:hover {
}

.meetings-card .meeting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.meetings-card .meeting-info .meeting-title {
  color: #272727;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

.meetings-card .meeting-info .meeting-sub {
  color: #929292;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px; /* 133.333% */
  letter-spacing: 0.1px;
}

.meetings-card .meeting-time {
  color: #272727;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px; /* 142.857% */
  letter-spacing: 0.1px;
}

.meetings-card .group-date {
  font-size: 11px;
  font-weight: 600;
  color: #aaa;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
