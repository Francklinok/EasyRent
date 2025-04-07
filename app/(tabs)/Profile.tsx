import { View, Text } from 'react-native'
import React from 'react'
import ProfileFile from '@/components/profile/ProfileComponent'
import OwnerProfileFile from '@/components/profile/ownerProfie'
import SellerProfileFile from '@/components/profile/sellerProfile'

const Profile = () => {
  return (
    <View>
        {/* <ProfileFile/> */}
        {/* <OwnerProfileFile/> */}
        <SellerProfileFile/>
    </View>
  )
}

export default Profile