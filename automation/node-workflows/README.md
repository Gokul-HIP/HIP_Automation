# Node workflow fixtures

One minimal workflow per catalog nodeType.

Hospital isolation: every fixture sets `workflow.hospital_id = 12` and documents that production lookup must use:

- trigger_type
- status = published/active
- hospital_id = booking.hospital_id

**No global/null hospital fallback.**

Generated files (46):

- start.workflow.json
- onChatMessage.workflow.json
- patientRegistered.workflow.json
- appointmentBooked.workflow.json
- appointmentRescheduled.workflow.json
- appointmentCompleted.workflow.json
- appointmentCancelled.workflow.json
- appointmentMissed.workflow.json
- prescriptionAdded.workflow.json
- medicineReminder.workflow.json
- labTestOrdered.workflow.json
- labReportNotification.workflow.json
- pharmacyRefillDue.workflow.json
- appointmentReminder.workflow.json
- birthday.workflow.json
- anniversary.workflow.json
- membershipExpiry.workflow.json
- userPlanExpiry.workflow.json
- rewardUpdated.workflow.json
- rewardsTierUpgraded.workflow.json
- familyPackageTierUpdated.workflow.json
- invoiceGenerated.workflow.json
- paymentReceived.workflow.json
- webhookEvent.workflow.json
- apiEvent.workflow.json
- scheduledEvent.workflow.json
- condition.workflow.json
- wait.workflow.json
- sendWhatsApp.workflow.json
- sendSms.workflow.json
- sendEmail.workflow.json
- sendPush.workflow.json
- sendAiChat.workflow.json
- sendAiVoice.workflow.json
- sendIvr.workflow.json
- sendTemplate.workflow.json
- dbCreate.workflow.json
- dbUpdate.workflow.json
- dbDelete.workflow.json
- updateAppointment.workflow.json
- updatePrescription.workflow.json
- updateMembership.workflow.json
- dbQuery.workflow.json
- httpRequest.workflow.json
- ai.workflow.json
- end.workflow.json
