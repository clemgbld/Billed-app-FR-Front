/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import postBill from "../__mocks__/mockPostBill.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the NewBill Page should be rendred", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });

    test("then 8 input fields sould be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const allInput = document.querySelectorAll(".form-control");
      expect(allInput.length).toEqual(8);
    });
  });

  describe("When i add a new file", () => {
    test("then it should changed in input if it's the right format", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      }); // Set localStorage
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" })); // Set user as Employee in localStorage
      const html = NewBillUI();
      document.body.innerHTML = html;
      let newBill = new NewBill({
        document,
        onNavigate: (pathname) =>
          (document.body.innerHTML = ROUTES({ pathname })),
        store: mockStore,
        localStorage: window.localStorage,
      });
      const inputFile = screen.getByTestId("file");
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["test.png"], "test.png", { type: "image/png" })],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0].name).toBe("test.png");
    });
  });

  describe("When i submit a bill", () => {
    test("then a new Bill is created", () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = () => {
        return;
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const submit = screen.getByTestId("form-new-bill");

      const BillValidData = {
        expenseType: "Transports",
        expenseName: "Vol Paris Londres",
        datePicker: "06/04/2022",
        amount: "348",
        vat: "70",
        pct: "20",
        commentary: "",
        fileName: "test.jpg",
        fileUrl:
          "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      };
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      newBill.createBill = (newBill) => newBill;
      userEvent.selectOptions(screen.getByTestId("expense-type"), [
        BillValidData.expenseType,
      ]);

      userEvent.type(
        screen.getByTestId("expense-name"),
        BillValidData.expenseName
      );

      userEvent.type(
        screen.getByTestId("datepicker"),
        BillValidData.datePicker
      );

      userEvent.type(screen.getByTestId("amount"), BillValidData.amount);

      userEvent.type(screen.getByTestId("vat"), BillValidData.vat);

      userEvent.type(screen.getByTestId("pct"), BillValidData.pct);

      userEvent.type(
        screen.getByTestId("commentary"),
        BillValidData.commentary
      );

      newBill.fileUrl = BillValidData.fileUrl;
      newBill.fileName = BillValidData.fileName;
      submit.addEventListener("click", handleSubmit);
      fireEvent.click(submit);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  //integration test POST request
  describe("When i add a file to the file input sucessfully", () => {
    test("then post bill from mock APi", async () => {
      const fakeNewBill = {
        id: "57qAXb6fIm29zKkLzMl",
        vat: "90",
        fileUrl:
          "https://teststorage.googleapis.com/v0/b/billable-178b6.a…f-1.jpg?alt=media&token=z1640e12-b24b-4b11-ae52-529152e8602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "déplacement billed",
        name: "encore",
        fileName: "preview-facture-free-807801-pdf-8.jpg",
        date: "2022-04-07",
        amount: 700,
        commentAdmin: "ok",
        email: "a@a",
        pct: 35,
      };

      const postNewBill = jest.spyOn(postBill, "post");

      const billsUpdated = await postNewBill(fakeNewBill);

      expect(postNewBill).toHaveBeenCalled();
      expect(billsUpdated.data.length).toBe(5);
    });
  });
});
