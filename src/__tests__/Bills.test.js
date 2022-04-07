/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  // TODO:
  describe("When i click on", () => {
    beforeEach(() => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      $.fn.modal = jest.fn(); // Prevent jQuery error
    });

    describe("on the new bill button", () => {
      test("then i should be redirected to the New Bill Page", async () => {
        await waitFor(() => screen.getByTestId("btn-new-bill"));
        const newBillBtn = screen.getByTestId("btn-new-bill");
        userEvent.click(newBillBtn);
        await waitFor(() => screen.getByTestId("title-new-bill"));
        const newBillHeading = screen.getByTestId("title-new-bill");
        expect(newBillHeading.textContent.trim()).toBe(
          "Envoyer une note de frais"
        );
      });
    });

    describe("on an icon-eye button", () => {
      test("then it should a modal with the right image", async () => {
        await waitFor(() => screen.getAllByTestId("icon-eye"));
        const firstIconEyeButton = screen.getAllByTestId("icon-eye")[0];
        userEvent.click(firstIconEyeButton);
        await waitFor(() => screen.getByAltText("Bill"));
        const billImage = screen.getByAltText("Bill");
        expect(billImage).toHaveAttribute(
          "src",
          "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"
        );
      });
    });
  });

  //integration test GET Bills
  describe("When i navigate to the bill Page", () => {
    test("then bills from mock API GET are fetched", async () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const contentPending = screen.getAllByText("pending");
      const contentRefused = screen.getAllByText("refused");
      const contentAccepted = screen.getAllByText("accepted");
      expect(contentPending.length).toEqual(1);
      expect(contentRefused.length).toEqual(2);
      expect(contentAccepted.length).toEqual(1);
    });

    test("then fetches bills from an Api fails with 404 message error", async () => {
      const getBillsSpy = jest.spyOn(mockStore, "bills");
      getBillsSpy.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });

      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      await waitFor(() => screen.getByText(/Erreur 404/));
      const message = screen.getByText(/Erreur 404/);

      expect(message).toBeTruthy();
    });

    test("then fetches bills from an Api fails with 500 message error", async () => {
      const getBillsSpy = jest.spyOn(mockStore, "bills");
      getBillsSpy.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      await waitFor(() => screen.getByText(/Erreur 500/));
      const message = screen.getByText(/Erreur 500/);

      expect(message).toBeTruthy();
    });
  });
});
