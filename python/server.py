import time, signal, threading
import socketio, eventlet

global mainclass

class Calc:
    def __init__(self) -> None:
        self.i = 0

    def countup(self):
        self.i += 1
    
    def countdown(self):
        self.i -= 1
    
    def get_num(self) -> int:
        return self.i
    
class MainClass:
    def __init__(self) -> None:
        self.calc = Calc()
        self.num = self.calc.get_num()
        pass
    def calculation(self, msg):
        if msg == 'countup':
            self.calc.countup()
        if msg == 'countdown':
            self.calc.countdown()
        
        num = self.calc.get_num()
        return num
    def get_num(self):
        return self.num


class SocketInterface(socketio.Namespace):
    def on_connect(self, sid, environ):
        # When connected to client.
        num = mainclass.get_num()
        self.emit('response', str(num))
        print('Connected.\n')

    def on_disconnect(self, sid):
        # When disconnected from client.
        print('Disconnected.\n')

    def on_calc(self, sid, msg):
        # When 'calc' event is sent.
        global mainclass
        print(msg + ' received!\n')
        num = mainclass.calculation(msg)

        print('number = ', num)
        eventName = 'result'
        arg = num
        self.emit(eventName, arg)
    
    def on_dict_msg(self, sid, msg):
        # You can send dict object.
        print('received!')
        print(msg)
        eventName = 'dict_msg'
        self.emit(eventName, msg)


    
class ThreadServer:
    def __init__(self, namespace):
        self.sio_       = socketio.Server(async_mode='eventlet')
        self.app_       = socketio.WSGIApp(self.sio_)
        self.Namespace  = SocketInterface(namespace)
        self.sio_.register_namespace(self.Namespace)
    def start(self):
        host = '127.0.0.1'
        eventlet.wsgi.server(eventlet.listen((host, 8000)), self.app_)
    def run(self):
        p = threading.Thread(target=self.start)
        p.setDaemon(True)
        p.start()


if __name__ == '__main__':
    mainclass = MainClass()

    signal.signal(signal.SIGINT, signal.SIG_DFL)
    thread_server = ThreadServer('/test')
    thread_server.run()

    while True:
        time.sleep(5)
    exit()