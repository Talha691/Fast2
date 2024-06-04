import { Ability, AbilityBuilder } from "@casl/ability";

// Defines how to detect object's type
function subjectName(item) {
	if (!item || typeof item === "string") {
		return item;
	}
	return item["__type"];
}

const ability = new Ability([], { subjectName });

function refresh(auth) {
	ability.update(defineRulesFor(auth));
}

function defineRulesFor(auth) {
	const { can, rules } = AbilityBuilder.extract();
	if (auth.type === "Super Admin") {
		// Data
		can(["view"], "summary");
		can(["view"], "reports");
		can(["add", "view", "edit", "delete"], "clients");
		can(["add", "view", "edit", "delete"], "agents");
		can(["add", "view", "edit", "delete"], "capturists");
		can(["view"], "agentsClients");
		can(["view"], "capturistsClients");
		can(["add", "view", "edit", "void"], "insurances");
		can(["view"], "search");

		// Admin
		can(["view"], "admin");
		can(["add", "view", "edit", "delete"], "coverages");
		can(["add", "view", "edit", "delete"], "expenses");
		can(["view"], "invoices");
		can(["add", "view"], "notifications");
		can(["add", "view", "edit", "delete"], "users");
		can(["add", "view", "edit", "delete"], "configuration");
		can(["add", "view", "edit", "delete"], "claims");
		can(["add", "view", "edit", "delete"], "payments");
	}

	if (auth.type === "Admin") {
		// Data
		can(["view"], "summary");
		can(["view"], "reports");
		can(["add", "view", "edit"], "coverages");
		can(["add", "view"], "insurances");
		can(["add", "view"], "clients");
		can(["view"], "search");

		// Admin
		can(["view"], "admin");
		can(["add", "view"], "agents");
		can(["add", "view"], "capturists");
	}

	if (auth.type === "Agent" || auth.type === "capturist") {
		// Data
		can(["view"], "summary");
		can(["view"], "reports");
		can(["manage", "view"], "cards");
		can(["add", "view", "edit", "delete"], "clients");
		can(["add", "view"], "insurances");

		//Admin
		can(["view"], "admin");
		can(["add", "view", "edit", "delete"], "employees");
	}

	if (auth.type === "Group") {
		// Data
		can(["view"], "summary");
		can(["view"], "reports");
		can(["add", "view", "edit", "delete"], "clients");
		can(["add", "view"], "insurances");

		// Admin
		can(["view"], "admin");
		can(["add", "view", "edit", "delete"], "employees");
	}

	if (auth.type === "Employee") {
		can(["add", "view"], "clients");
		can(["add", "view"], "insurances");
	}

	return rules;
}

export default {
	ability,
	refresh,
};
