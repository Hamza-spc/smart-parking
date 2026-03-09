import {
    PiHouseLineDuotone,
    PiCarDuotone,
    PiCalendarCheckDuotone,
    PiCreditCardDuotone,
    PiShieldCheckDuotone,
    PiChartBarDuotone,
    PiUsersDuotone,
    PiListChecksDuotone,
    PiWalletDuotone,
    PiMapPinDuotone,
} from 'react-icons/pi'

const navigationIcon = {
    home: <PiHouseLineDuotone />,
    parkings: <PiCarDuotone />,
    parkingMap: <PiMapPinDuotone />,
    reservations: <PiCalendarCheckDuotone />,
    payments: <PiCreditCardDuotone />,
    admin: <PiShieldCheckDuotone />,
    adminDashboard: <PiChartBarDuotone />,
    users: <PiUsersDuotone />,
    adminReservations: <PiListChecksDuotone />,
    adminPayments: <PiWalletDuotone />,
}

export default navigationIcon
