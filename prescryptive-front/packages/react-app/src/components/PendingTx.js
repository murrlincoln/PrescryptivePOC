import React from "react"
import {StyleSheet, View} from 'react-native'

function PendingTx() {
    
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#e5e5e5",
    },
    headerText: {
      fontSize: 20,
      textAlign: "center",
      margin: 10,
      fontWeight: "bold"
    },   
    OvalShapeView: {    
      marginTop: 20,
      width: 150,
      height: 150,
      backgroundColor: '#FF9800',
      borderRadius: 120,
      transform: [{ scaleX: 2 }],
   },
  
  });

    return (
        <View style={styles.container}>
            <View style={styles.OvalShapeView}>
            </View>
        </View>
    )

}




export default PendingTx