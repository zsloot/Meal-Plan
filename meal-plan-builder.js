// Meal Plan Builder — Drafts Action
// Builds a plain-text meal planning template via a series of prompts.

var MEALS = [
  "BREAKFAST",
  "BRUNCH",
  "LUNCH",
  "SNACK",
  "COCKTAIL",
  "DINNER",
  "MIDNIGHT SNACK"
];

var DEFAULTS_ON = ["BRUNCH", "SNACK", "DINNER"];

var DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
var MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// --- Step 1: Plan details ---

var p1 = new Prompt();
p1.title = "Meal Plan Builder";
p1.message = "Set up your meal plan.";

p1.addTextField("planName", "Plan Name", "", { placeholder: "Beach Week 2026" });
p1.addTextField("peopleCount", "Number of People", "4", { keyboard: true });
p1.addTextField("notes", "Notes", "", { placeholder: "one shellfish allergy" });
p1.addDatePicker("startDate", "First Day", new Date(), { mode: "date" });

var endDefault = new Date();
endDefault.setDate(endDefault.getDate() + 3);
p1.addDatePicker("endDate", "Last Day", endDefault, { mode: "date" });

p1.addButton("Next");

if (!p1.show()) {
  context.cancel();
  app.displayInfoMessage("Cancelled");
  // stop execution
}
else {

var planName = p1.fieldValues["planName"].trim();
var peopleCount = parseInt(p1.fieldValues["peopleCount"]) || 0;
var notes = p1.fieldValues["notes"].trim();
var startDate = p1.fieldValues["startDate"];
var endDate = p1.fieldValues["endDate"];

if (endDate < startDate) {
  app.displayErrorMessage("Last day must be on or after first day.");
  context.cancel();
}
else {

// --- Step 2: Select meals ---

var p2 = new Prompt();
p2.title = "Select Meals";
p2.message = "Choose which meals repeat each day.";

for (var i = 0; i < MEALS.length; i++) {
  p2.addSwitch(MEALS[i], MEALS[i], DEFAULTS_ON.indexOf(MEALS[i]) !== -1);
}

p2.addButton("Build Template");

if (!p2.show()) {
  context.cancel();
  app.displayInfoMessage("Cancelled");
}
else {

var selectedMeals = [];
for (var i = 0; i < MEALS.length; i++) {
  if (p2.fieldValues[MEALS[i]]) {
    selectedMeals.push(MEALS[i]);
  }
}

if (selectedMeals.length === 0) {
  app.displayErrorMessage("Select at least one meal.");
  context.cancel();
}
else {

// --- Build output ---

var lines = [];

if (planName) {
  lines.push(planName.toUpperCase());
}

var sub = "";
if (peopleCount) sub += peopleCount + " people";
if (peopleCount && notes) sub += " - ";
if (notes) sub += notes;
if (sub) lines.push(sub);

if (lines.length > 0) lines.push("");

var startMs = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
var endMs = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
var totalDays = Math.round((endMs - startMs) / 86400000) + 1;

var cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
var dayIndex = 0;

while (dayIndex < totalDays) {
  var dayName = DAYS[cursor.getDay()];
  var monthName = MONTHS[cursor.getMonth()];
  var dateNum = cursor.getDate();

  lines.push(dayName + " - " + monthName + " " + dateNum);

  var dayMeals;
  if (dayIndex === 0 && totalDays > 1) {
    dayMeals = [selectedMeals[selectedMeals.length - 1]];
  } else if (dayIndex === totalDays - 1 && totalDays > 1) {
    dayMeals = [selectedMeals[0]];
  } else {
    dayMeals = selectedMeals;
  }

  for (var m = 0; m < dayMeals.length; m++) {
    lines.push("   " + dayMeals[m] + " - ");
  }

  lines.push("");
  cursor.setDate(cursor.getDate() + 1);
  dayIndex++;
}

while (lines.length && lines[lines.length - 1] === "") lines.pop();

var output = lines.join("\n");

var d = new Draft();
d.content = output;
d.update();

editor.load(d);
app.displaySuccessMessage("Meal plan template created!");

} // selectedMeals check
} // p2 show
} // date validation
} // p1 show
