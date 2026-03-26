const BookingList = () => {
  // Mock data for display
  const bookings = [
    { id: '#LT-102', guest: 'Rahul Varma', date: '2026-03-15', type: 'Staycation', status: 'Paid', amount: '₹12,000' },
    { id: '#LT-103', guest: 'Sanjay Nair', date: '2026-03-18', type: 'Daycation', status: 'Pending', amount: '₹12,400' },
    { id: '#LT-104', guest: 'Anjali P.', date: '2026-03-22', type: 'Events', status: 'Paid', amount: '₹20,000' },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-6 py-4 font-medium">Guest</th>
            <th className="px-6 py-4 font-medium">Date</th>
            <th className="px-6 py-4 font-medium">Type</th>
            <th className="px-6 py-4 font-medium">Amount</th>
            <th className="px-6 py-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-sm">
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 font-medium text-farm-dark">{b.guest}</td>
              <td className="px-6 py-4 text-gray-600">{b.date}</td>
              <td className="px-6 py-4 uppercase text-[10px] font-bold tracking-widest text-farm-sage">{b.type}</td>
              <td className="px-6 py-4 text-gray-600 font-mono">{b.amount}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${b.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {b.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingList;