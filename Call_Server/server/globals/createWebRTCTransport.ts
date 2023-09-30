import { Transport, Router, WebRtcTransport, AppData, WebRtcTransportData } from "mediasoup/node/lib/types"



const ListenIP = process.env.IP

const createWebRtcTransport = async (router:Router):Promise<WebRtcTransport> => {
    return new Promise(async (resolve, reject) => {
      try {
  
        const webRtcTransport_options = {
          listenIps: [
            {
              ip: ListenIP, // replace with relevant IP address
              announcedIp: ListenIP,
            }
          ],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
        }
  
        // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
        let transport = await router.createWebRtcTransport(webRtcTransport_options)
        console.log(`Createing Transport ID : transport id: ${transport.id}`)
  
        transport.on('dtlsstatechange', dtlsState => {
          if (dtlsState === 'closed') {
            transport.close()
          }
        })
  
        transport.on('@close', () => {
          console.log('transport closed')
        })
  
        resolve(transport)
  
      } catch (error) {
        reject(error)
      }
    })
  }

  export default createWebRtcTransport