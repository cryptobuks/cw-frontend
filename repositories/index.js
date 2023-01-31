import SettingsRepo from './SettingsRepo'
import AuthRepo from './AuthRepo'
import CountryRepo from './CountryRepo'
import ProfileRepo from './ProfileRepo'
import ChatRepo from './ChatRepo'
import GymDeviceRepo from './GymDeviceRepo'
import GymHoursRepo from './GymHoursRepo'
import ContractsRepo from './ContractsRepo'
import ContactsRepo from './ContactsRepo'
import ProductRepo from './ProductRepo'
import PwaRepo from './PwaRepo'
import CalendarRepo from './CalendarRepo'
import CertificatesRepo from './CertificatesRepo'
import StatRepo from './StatRepo'
import FinanceRepo from './FinanceRepo'

export default (context) => {
  return {
    authRepo: AuthRepo(context),
    chatRepo: ChatRepo(context),
    contactsRepo: ContactsRepo(context),
    contractsRepo: ContractsRepo(context),
    countryRepo: CountryRepo(context),
    gymDeviceRepo: GymDeviceRepo(context),
    gymHoursRepo: GymHoursRepo(context),
    profileRepo: ProfileRepo(context),
    settingsRepo: SettingsRepo(context),
    productRepo: ProductRepo(context),
    pwaRepo: PwaRepo(context),
    calendarRepo: CalendarRepo(context),
    certificatesRepo: CertificatesRepo(context),
    statRepo: StatRepo(context),
    financeRepo: FinanceRepo(context)
  }
}
