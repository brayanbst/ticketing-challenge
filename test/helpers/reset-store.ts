import { store } from '../../src/tickets/shared/inmem.store';

export function resetStore() {
  store.events.clear();
  store.seatState.clear();
  store.generalAvailable.clear();
  store.reservations.clear();
  store.orders.clear();
  store.paymentProviderIds.clear();
}
