require("dotenv").config({ path: "./.env" });
const cron = require("node-cron");
const { bot } = require("./src/bot");
const { startScheduler } = require("./src/scheduler");

console.log("🟢 Starting the local bot...");

// Function to start the bot
async function startBot() {
    try {
        console.log("🤖 Launching the local bot...");
        await bot.launch({ dropPendingUpdates: true });
        console.log("🚀 Local bot is running...");
    } catch (error) {
        console.error("❌ Error launching local bot:", error);
    }
}

// Function to stop the bot
async function stopBot() {
    try {
        console.log("🛑 Stopping the local bot...");
        await bot.stop();
        console.log("✅ Local bot stopped.");
        process.exit(0); // Graceful shutdown
    } catch (error) {
        console.error("❌ Error stopping local bot:", error);
    }
}

// Start the bot immediately
startBot();

// Auto-shutdown at 7:30 PM (UTC)
cron.schedule("30 19 * * *", () => {
    console.log("🔔 Scheduled shutdown at 7:30 PM UTC.");
    stopBot();
});

// ✅ Start the Scheduler (if needed)
(async () => {
    console.log("🔄 Starting the scheduler...");
    try {
        startScheduler();
        console.log("✅ Scheduler Started Successfully!");
    } catch (error) {
        console.error("❌ Error in startScheduler():", error);
    }
})();


// 🚀 Start the bot
startBot();
