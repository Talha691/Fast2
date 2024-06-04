import { firestore } from "../../../firebase/firebase";
import moment from "moment";
import async from "async";

function generateCsv(uid) {
	return new Promise(async resolve => {
		const csvData = [];

		const carInsuranceCollection = await firestore
			.collection("car-insurance")
			.where("agent", "==", firestore.doc("/agents/" + uid))
			.get();
		const truckInsuranceCollection = await firestore
			.collection("truck-insurance")
			.where("agent", "==", firestore.doc("/agents/" + uid))
			.get();

		const paymentsCollection = await firestore.collection("agents/" + uid + "/payments").get();
		const coverages = await firestore.collection("coverage").get();

		const weeklyPaymentData = paymentsCollection.docs.map(item => {
			return {
				timestamp: item.data().date?.toDate(),
				from: item.data().range?.[0]?.toDate(),
				to: item.data().range?.[1]?.toDate(),
				amount: item.data().paymentAmount,
				type: item.data().type,
				checkNumber: item.data().checkNumber,
			};
		});

		const carInsuranceData = carInsuranceCollection.docs.map(item => {
			return {
				method: item.data().method,
				coverage: coverages.docs.find(x => x.id === item.data().coverage.id),
				insuranceID: item.data().insuranceID,
				void: item.data().void,
				timestamp: item.data().timestamp.toDate(),
				amount: item.data().total,
			};
		});
		const truckInsuranceData = truckInsuranceCollection.docs.map(item => {
			return {
				method: item.data().method,
				coverage: coverages.docs.find(x => x.id === item.data().coverage.id),
				insuranceID: item.data().insuranceID,
				void: item.data().void,
				timestamp: item.data().timestamp.toDate(),
				amount: item.data().total,
			};
		});
		const mergedData = carInsuranceData.concat(truckInsuranceData).filter(x => x["void"] !== true);
		mergedData.sort((a, b) => {
			return moment(a.timestamp).unix() - moment(b.timestamp).unix();
		});

		const lastDate = moment(mergedData[mergedData.length - 1].timestamp);
		const latestDate = moment(mergedData[0].timestamp);
		const numberOfWeeks = lastDate.diff(latestDate, "weeks") + 2;
		await async.times(numberOfWeeks > 0 ? numberOfWeeks : 1, (n, next) => {
			const weekStart = moment()
				.add(1, "week")
				.subtract(numberOfWeeks - n, "week")
				.startOf("week")
				.subtract(2, "days");
			const weekEnd = moment()
				.add(1, "week")
				.subtract(numberOfWeeks - n, "week")
				.endOf("week")
				.subtract(2, "days");

			const weeklyPayment = weeklyPaymentData.filter(x => {
				if (x.from && x.to) {
					const from = moment(x.from);
					return from.isBetween(weekStart, weekEnd);
				} else {
					const time = moment(x.timestamp);
					return time.isBetween(weekStart, weekEnd);
				}
			});

			const filteredData = mergedData.filter(x => {
				const time = moment(x.timestamp);
				return time.isBetween(weekStart, weekEnd);
			});

			if (!filteredData.length) {
				csvData.push({
					Dates: weekStart.format("ll") + " - " + weekEnd.format("ll"),
					Total: 0,
					Payment: "",
					Owes: csvData.length ? csvData[csvData.length - 1].Owes : 0,
				});
				weeklyPayment.forEach(item => {
					const type = item.type === "commission" ? "Commission" : "Payment";
					const date = moment(item.timestamp).format("lll");
					const check = item.checkNumber ? `Check: ${item.checkNumber}` : "";
					const ranges = item.from ? `${moment(item.from).format("ll")} - ${moment(item.to).format("ll")}` : null;

					csvData.push({
						Dates: `${type} -> ${ranges ? ranges : date} ${check}`,
						Total: "",
						Payment: item.amount,
						Owes: csvData[csvData.length - 1]?.Owes - item.amount,
					});
				});
				return next();
			}

			const credit = filteredData
				.filter(x => x.method === "Credit")
				.reduce((a = 0, i) => {
					if (!i.coverage) return a;
					return a + i.coverage?.data()?.profit;
				}, 0);

			const commission = filteredData
				.filter(x => x.method === "Card" || !x.method)
				.reduce((a = 0, i) => {
					if (!i.coverage) return a;
					return a + i.coverage.data().commission;
				}, 0);

			const useCredit = credit ? credit : 0;
			csvData.push({
				Dates: weekStart.format("ll") + " - " + weekEnd.format("ll"),
				Total: useCredit,
				Payment: "",
				Owes: csvData.length ? csvData[csvData.length - 1]?.Owes + useCredit : useCredit,
			});

			csvData.push({
				Dates: `Commission -> ${weekStart.format("ll")} - ${weekEnd.format("ll")}`,
				Total: "",
				Payment: commission,
				Owes: csvData[csvData.length - 1]?.Owes - commission,
			});

			weeklyPayment.forEach(item => {
				const type = item.type === "commission" ? "Commission" : "Payment";
				const date = moment(item.timestamp).format("lll");
				const check = item.checkNumber ? `Check: ${item.checkNumber}` : "";
				const ranges = item.from ? `${moment(item.from).format("ll")} - ${moment(item.to).format("ll")}` : null;

				csvData.push({
					Dates: `${type} -> ${ranges ? ranges : date} ${check}`,
					Total: "",
					Payment: item.amount,
					Owes: csvData[csvData.length - 1]?.Owes - item.amount,
				});
			});
			next();
		});

		const totalPayments = csvData.reduce((a = 0, i) => {
			return a + Number(i.Payment);
		}, 0);
		const totalCredit = csvData.reduce((a = 0, i) => {
			return a + Number(i.Total);
		}, 0);

		csvData.push({
			Dates: "Totals: ",
			Total: totalCredit,
			Payment: totalPayments,
			Owes: totalCredit - totalPayments,
		});
		resolve(csvData);
	});
}
export default generateCsv;
