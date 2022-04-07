import mockedBills from "./store.js";

const postBill = {
  post: async (request) => {
    const oldData = await mockedBills.bills().list();

    return Promise.resolve({
      data: [
        ...oldData,
        {
          id: request.id,
          vat: request.vat,
          fileUrl: request.fileUrl,
          status: request.status,
          type: request.type,
          commentary: request.commentary,
          name: request.name,
          fileName: request.fileName,
          date: request.date,
          amount: request.amount,
          commentAdmin: request.commentAdmin,
          email: request.email,
          pct: request.pct,
        },
      ],
    });
  },
};

export default postBill;
