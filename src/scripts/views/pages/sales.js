import { createSalesTemplate } from '../template/template-creator';

const Sales = {
  async render() {
    return `
      <div class="content">
        <h2 class="content__heading">Penjualan Hari Ini</h2>
        <div id="sales-content">
          ${createSalesTemplate()}
        </div>
      </div>
    `;
  },

  async afterRender() {
    const form = document.querySelector('.purchase-form form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Handle form submission here
      // You can add logic to update the sales table and status
    });

    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Handle edit functionality
      });
    });

    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Handle delete functionality
      });
    });
  },
};

export default Sales;
