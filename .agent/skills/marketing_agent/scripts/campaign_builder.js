export function campaignBuilder({ businessName, businessType, location, goal, channel }) {
  const templates = {
    whatsapp: [
      `📢 *SPECIAL ANNOUNCEMENT FROM ${businessName.toUpperCase()}* 📢\nHey ${location}! We've got something special! 🇿🇦\n\n🔥 *${goal}* 🔥\n\n📍 Find us in ${location}\n📲 WhatsApp us now!`,
      `💥 *FLASH SALE — ${businessName}* 💥\n📍 ${location}\n\n👉 *${goal}*\n\nCome through! 🇿🇦`
    ],
    sms: [
      `${businessName} in ${location}: ${goal}. Visit us today! 🇿🇦`,
      `FLASH: ${businessName} - ${goal}. Don't miss out!`
    ]
  };
  const selected = templates[channel] || templates.whatsapp;
  return {
    text: selected[0],
    channel,
    businessName,
    location
  };
}
