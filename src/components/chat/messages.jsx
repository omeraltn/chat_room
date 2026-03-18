import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db, auth } from "../../firebase";
import Message from "./message";
import Arrow from "./arrow";

const Messages = ({ room }) => {
  const [isAtBottom, setIsBottom] = useState(true);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCoun] = useState(0);
  const lastMessageRef = useRef();
  const prevMessagesLength = useRef(0);
  const audioRef = useRef(new Audio("/notification.mp3"));

  //veritabanındaki mesajları anlık olarak ak
  useEffect(() => {
    //belgelerini alacağımız kolleksiyonun referansını al
    const collectionRef = collection(db, "messages");

    //sorgu ayarlarını yap
    const q = query(
      collectionRef,
      where("room", "==", room),
      orderBy("createdAt", "asc"),
    );

    //messages kolleksiyonundaki verileri al
    const unsub = onSnapshot(q, (snapshot) => {
      //mesajların geçici olarak tutulduğu dizi
      const temp = [];
      //her belgenin içerisindeki dataya erişip diziye aktar
      snapshot.docs.forEach((doc) => temp.push(doc.data()));
      setMessages(temp);
    });

    //kullanıcı sayfadan ayrılınca  SnapShot ı durdur
    return () => {
      unsub();
    };
  }, []);

  //her yeni mesaj gelince çalışır
  useEffect(() => {
    if (messages.length < 1) return;

    //gönderilen son mesaja eriş
    const lastMsg = messages.at(-1);

    //son mesaja odaklan
    if (lastMsg.author.id === auth.currentUser.uid) {
      //Eğer son mesajı ben attıysam son mesaja odaklan aşağı kaydır

      scrollToBottom();
    } else if (isAtBottom) {
      //eğer son mesajı başkası attıysa ve ben sayfanın alt kısmındaysam son mesaja odaklan
      scrollToBottom();
    }

    //kullanıcı yukardayken yeni mesaj geldiyse
    if (messages.length > prevMessagesLength.current && !isAtBottom) {
      //atılan son mesajı başkası attıysa okunmadı sayısını attır
      if (lastMsg.author.id !== auth.currentUser.uid) {
        setUnreadCoun((prev) => prev + 1);
      }
      // toplam mesaj sayısını tuttuğumuz referansı güncelle
      prevMessagesLength.current = messages.length;
      playSound();
    }
  }, [messages]);

  //sayfadaki son mesaja kaydır
  const scrollToBottom = () => {
    //listedeki son mesaja kaydır
    lastMessageRef.current.scrollIntoView();
    setUnreadCoun(0);
  };

  // scroll kaydırılınca çalışır
  const handleScroll = (e) => {
    //clientHeight : containerin kullanıcı ekranındaki yüksekliği 824 header - form arası dinamik olur
    //scrollTop : kullanıcı yukardan aşağıya kaç px kaydırdı 740
    //scrollHeight : tüm içeriğin yüksekliği - gizli kısımlar dahil tüm messagesdaki mesajların hepsi- tüm scrollayabildiğimiz alan - 1564
    const { clientHeight, scrollTop, scrollHeight } = e.target;

    // kullanıcı sayfanın en alt kısmına  yakın mı
    setIsBottom(scrollTop + clientHeight >= scrollHeight - 100);
  };

  //bildirim sesi oynat

  const playSound = async () => {
    await audioRef.current.play();
  };
  return (
    <main
      onScroll={handleScroll}
      className="flex-1 p-3 flex flex-col w-full overflow-y-auto overflow-x-hidden relative gap-3 "
    >
      {messages.length < 1 ? (
        <div className="h-full grid place-items-center text-zinc-400">
          <p>Sohbete ilk mesajı siz atın...</p>
        </div>
      ) : (
        messages.map((i, key) => <Message key={key} item={i} />)
      )}

      <div ref={lastMessageRef} />
      <Arrow
        scrollToBottom={scrollToBottom}
        isAtBottom={isAtBottom}
        unreadCount={unreadCount}
      />
    </main>
  );
};

export default Messages;
