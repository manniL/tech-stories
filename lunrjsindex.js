var documents = [

{
    "id": 0,
    "uri": "search.html",
    "menu": "-",
    "title": "Search",
    "text": " lokale Suche https://codersblock.com/blog/mini-previews-for-links/ div#searchresults h3 { font-size: larger; margin-top: 0 !important; } div#searchresults h4 { font-size: large; } div#searchresults span { font-size: small; } div#searchresults span.menu { font-size: medium; margin-top: 1em; } function dosearch(element) { if (element.value.length>=3) { var searchresults = document.querySelector('#searchresults'); out = ; var results = idx.search(element.value); if (results.length == 0) { results = idx.search(element.value+*); } if (results.length == 0) { results = idx.search(*+element.value+*); } if (results.length == 0) { results = idx.search(element.value+~1); } var lastMenu =  var lastTitle =  results.forEach(function (item) { var doc = documents[item.ref]; out +=  +doc.menu+ ; if (doc.menu != lastMenu) { lastMenu = doc.menu; } out +=   + doc.title +  ; for(var field in item.matchData.metadata) { console.log(field); var matches = item.matchData.metadata[field] if (matches['text']) { matches['text']['position'].forEach(function (pos) { var subtext = doc.text.substring(pos[0]-50,pos[0]+pos[1]+50); if (pos[0]>0) { subtext = subtext.replace(new RegExp(/^[^ ]*/,i),...); } subtext = subtext.replace(new RegExp(/[^ ]*$/,i),...); var re = new RegExp(field,gi); subtext = subtext.replace(re, $& ); out +=   + subtext +  ; }) } } searchresults.innerHTML = out; }) } } var input = document.querySelector(#lunrsrc); input.focus(); var params = new URLSearchParams(window.location.search); input.value = params.get('q'); dosearch(input); "
},

{
    "id": 1,
    "uri": "blog/2023/2023-05-05-loom-threading.html",
    "menu": "Blog",
    "title": "Projekt Loom ist da",
    "text": " Table of Contents Threading wie es sein soll: Projekt Loom ist da Virtualisierung hilft schon immer … und der Weg ins Schlamassel Threads sind die Grundlage der Nebenläufigkeit Asynchrone Programmierung als Notlösung Projekt Loom als Rettung VirtualThreads: benutzen ist (fast) einfacher als vermeiden Anpassungen im eigenen Code Angewohnheiten hinterfragen Synchron war nie schlecht Ausblick: Structured Concurrency Threading wie es sein soll: Projekt Loom ist da Es ist endlich so weit - das lang ersehnte Projekt Loom hat seinen Weg in das JDK gefunden! Seit über fünf Jahren haben wir uns danach gesehnt, all die Krücken wie NIO , asynchrone Programmierung , CompletableFutures und AsyncServlets hinter uns zu lassen und Java wieder so zu schreiben, wie wir es schon immer wollten. Virtualisierung hilft schon immer Auf jedem Rechner gibt es Ressourcen, die begrenzt sind. CPU-Zeit ist seit jeher eine knappe Ressource. Gleichzeitig müssen jedoch häufig viele kleine Aufgaben erledigt werden. Heutzutage verwenden wir meist API-Backends, die Anfragen über HTTP erhalten. Sie lesen Daten, transformieren sie und verändern sie gegebenenfalls. Anschließend wird die Antwort per Netzwerk-IO gesendet. Dabei die Ressourcen effizient zu nutzen, war von Anfang an eine Herausforderung und erforderte viel manuelle Arbeit. Zum Glück hatte Edsger W. Dijkstra bereits im Jahr 1965 die brillante Idee, den Zugriff auf wertvolle Ressourcen zu virtualisieren. So bekam das Berkeley Timesharing System die ersten Threads der Computer-Geschichte. Das Konzept war einfach: Threads sind kostengünstig und virtualisieren den Zugriff auf wertvolle Ressourcen. Figure 1. Threading wie die Urahnen - mit einer CPU Ein Scheduler sorgt dafür, dass blockierte Threads unterbrochen werden und andere Aufgaben ausgeführt werden können, bis die notwendigen Ressourcen verfügbar sind. Ein wahrhaft revolutionäres Konzept! Die Welt hat sich seit den ersten Threads des Berkeley Timesharing Systems weiterentwickelt. „Moderne“ Betriebssysteme wie AmigaOS haben das Konzept des Threading verbessert, indem sie es dem Betriebssystem erlauben, rechnende Prozesse zu unterbrechen und an anderer Stelle fortfahren zu lassen. Anders als bei User Threads in SunOS , wo der Code im Thread selbst anzeigt, wann er unterbrochen werden soll. … und der Weg ins Schlamassel Wir haben seitdem viel getan, um das Thread-Konzept kaputt zu bekommen. Wir nutzen gerade Netz-IO in modernen Anwendungen ganz intensiv. IO ist oft das, was diese Anwendungen am meisten machen. Und auf der anderen Seite ist die Hardware viel schneller als `65 . Wir haben so viele Requests zu verarbeiten und die Rechner sind schnell genug. Das geht. Wir können mal eben eine Million Sockets offenhalten und damit arbeiten. Nur: das Threading selbst kommt nur mit ein paar zehntausend Threads klar. Und deswegen sind inzwischen die Threads selbst die wertvolle Ressource. Und deswegen mussten wir anfangen, die Threads selbst zu teilen, zu poolen und sie wiederzuverwenden. Hierhin fällt der Aufstieg der Event-basierten IO-Bibliotheken . Netty fällt in diese Kategorie. Figure 2. IO-Thread und Worker-Thread bei der Arbeit IO und Worker Threads: ein speziell für IO-Operationen abgestellter Thread nimmt Daten entgegen. Dieser Thread wickelt sämtliche IO-Operationen ab. Damit entfällt auch die Notwendigkeit für Locking und Synchronisierung. Sobald Daten eingetroffen sind, werden sie in separaten Worker-Threads verarbeitet. Worker-Threads sollen selbst nie blockieren. Es wird dabei meistens nur ein Thread (manchmal einer pro CPU) mit IO beauftragt. Er arbeitet mit „non-blocking IO“ , erhält also Events, sobald eine IO-Operation abgeschlossen ist. Dadurch kann ein Thread alle offenen Sockets auf einmal bearbeiten. Sobald das IO abgeschlossen ist, wandert die Arbeit zu einem Worker-Thread weiter, der Berechnungen vornimmt. So lässt sich in unserem Beispiel bei drei gleichzeitig aktiven Requests die Thread-Zahl auf zwei reduzieren. Der Preis dafür ist, dass die Worker-Threads selbst Bescheid geben müssen, wenn sie fertig sind. Da ist dann das „alte“ kooperative Multitasking wieder. In der Praxis spielt das aber weniger eine Rolle, weil wir mehrere Worker-Threads benutzen, als Thread-Pool. Trotzdem – wir bezahlen gleich mehrere Preise dafür: Für jeden Request gibt es mindestens zwei Thread-Wechsel. Und die sind teuer. Sind Teile der Anwendung rechenintensiv, dann müssen wir selbst dafür sorgen, dass sie niemanden blockieren. Dann gibt es mehrere Thread-Pools. &#8230;&#8203; und wir brauchen ein kluges Threading-Konzept. Meistens heißt das, verschiedene Pools für Rechenlast, Netzwerk und File-IO einzuführen. Die IO-APIs sind alles andere als einfach zu bedienen. Und immer etwas anders. Netty für Netzwerk-IO. NIO für File-IO. RDBC für den Datenbankzugriff. Threads sind die Grundlage der Nebenläufigkeit Die Kernkonzepte von Java basieren auf Threads. Das gilt für den Sprachkern, die VM, fürs Debugging und das Profiling. IO-APIs waren synchron und sind in synchroner Form heute noch am übersichtlichsten zu benutzen. Das gesamte Exception-System ergibt nur innerhalb eines Threads wirklich Sinn. Speicherzugriffe innerhalb eines Threads sind geordnet und überschaubar. Wir könnten am übersichtlichsten alle Arbeit für einen Request in einem eigenen Thread erledigen. Wir könnten einfach einen Thread pro Request starten , synchrone APIs verwenden. Aber es geht nicht, weil einfach zu wenige Threads verfügbar sind. Asynchrone Programmierung als Notlösung Als Konsequenz opfern wir den Java-Sprachkern und verwenden reaktive Bibliotheken. Und müssen uns für Konstrukte wie Schleifen, If und Try-Catch komplett neue Konstrukte einfallen lassen. CompletableFuture .supplyAsync(info::getUrl, pool) .thenCompose(url -&gt; getBodyAsync( pool, HttpResponse.BodySubscribers.ofString(UTF_8))) .thenApply(info::findImage) .thenCompose(url -&gt; getBodyAsync( pool, HttpResponse.BodySubscribers.ofByteArray())) .thenApply(info::setImageData) .thenAccept(this::process) .exceptionally(t -&gt; { t.printStackTrace(); return null; }); Ohne auf den konkreten Inhalt dieses Handlers einzugehen, lässt sich die Auswirkung auf die Struktur der Programmiersprache erkennen: Das Programm wird nicht mehr in der üblichen Weise strukturiert, sondern über eine Fluent API erstellt und gestartet. Im Kern stellt das eine Monade dar, wie sie zum Beispiel aus Haskell bekannt ist. Dieses neue Sprachkonstrukt hat eine Reihe von Folgen, die interessant zu nutzen sind. Mit all den Problemen, die daraus resultieren, dass jetzt JVM, Werkzeuge, Sprache und Tools nicht mehr so recht zusammenpassen wollen: In Stack Traces steht oft kaum noch Hilfreiches . Mit dem Debugger durch ein reaktives Programm zu steppen ist eine Herausforderung. Und die Ursache für Lastprobleme zu finden, ist problematisch. Diesen Programmierstil verwenden wir definitiv nicht, weil er einfacher zu verstehen wäre. Oder weil er sonst irgendwie nützlicher zu handhaben wäre. Wir verwenden diesen Programmierstil, weil wir nicht anders skalieren können. Projekt Loom als Rettung Die Idee hinter Projekt Loom: Threads müssen wieder so billig werden wie damals. Es darf kein Problem sein, Millionen davon zu starten. Die JVM mappt dazu ihre eigene Art von Threads, die dort VirtualThreads heißen, auf Betriebssystem-Threads. Das ist ein M:N-Mapping. Also anders als damals zu Solaris-Zeiten, als „Green Threads“ eben nur auf einen einzigen OS-Thread abgebildet werden konnten. Aber ziemlich so, wie es in Erlang schon immer war. Und auch die Go-Fans lachten ja bereits über uns Java-Menschen. Die JVM kann das deswegen besser als das Betriebssystem, weil es zum einen mehr Wissen besitzt (zum Beispiel über Stack-Größen und das Speichermodell) und zum anderen, weil es Threads nicht jederzeit unterbrechen kann. Stattdessen wird nur dort unterbrochen, wo es blockierende Operationen gibt. Das sind hauptsächlich IO-Operationen, aber auch dort, wo wir in unseren Programmen manuell synchronisieren. Damit das funktioniert, gab es im Rahmen des Projekts Loom Anpassungen quer durch die JVM und die Basis-Bibliotheken. NIO wurde umgebaut. Das „alte“ IO wurde angepasst (und darf und soll damit ruhig wieder benutzt werden). Nur File-IO unter Windows ist noch ein Problem und dauert noch. VirtualThreads: benutzen ist (fast) einfacher als vermeiden Seit Java 19 können wir Threads sehr einfach als „virtual“ starten: var thread = Thread.startVirtualThread(() -&gt; { ... }); Das ist schon alles. Die JVM kümmert sich darum, dass diese VirtualThreads automatisch auf OS-Threads abgebildet werden. Normalerweise auf einen pro CPU-Kern. In diesem VirtualThread lassen sich nach Herzens Lust blockierende Aufrufe, Locks und Sleeps in synchroner Art platzieren. Wir sollen uns keine Gedanken mehr darüber machen, wie der Wettstreit um die Ressourcen läuft. Anpassungen im eigenen Code Einige Code-Konstrukte spielen nicht so gut mit VirtualThreads zusammen. Wir können sie ersetzen, damit der Code noch besser skaliert. Ganz weit vorne ist (jedenfalls derzeit) noch der „synchronized“-Block. Der hängt immer an einem OS-Thread, weil er mit Betriebssystemmitteln implementiert ist. Wir wollen ihn mit „ReentrantLock“ oder noch besser mit „StampedLock“ ersetzen. Der zweite Bereich sind JNI-Aufrufe. Die sind immer dann problematisch, wenn sie innerhalb von „synchronized“ passieren. Vor allem, wenn wir von nativem Code wieder nach Java callen, zum Beispiel bei Callbacks. Alles das muss uns aber nicht aufhalten. In den meisten Fällen machen ein paar wenige solche Stellen wenig aus. Viele Frameworks integrieren VirtualThreads bereits In Spring Boot Projekten werden wir bereits dahin geführt, dass wir Threading an zentraler Stelle implementieren. So wie Spring Boot es intern auch bereits macht. Wir können heute schon dafür sorgen, dass Spring Boot auf VirtualThreads setzt: @Configuration class ConfigureVirtualThreads { @Bean(TaskExecutionAutoConfiguration.APPLICATION_TASK_EXECUTOR_BEAN_NAME) public AsyncTaskExecutor asyncTaskExecutor() { return new TaskExecutorAdapter( Executors.newVirtualThreadPerTaskExecutor()); } @Bean public TomcatProtocolHandlerCustomizer&lt;?&gt; protocolHandlerVirtualThreadExecutorCustomizer() { return protocolHandler -&gt; { protocolHandler.setExecutor( Executors.newVirtualThreadPerTaskExecutor()); }; } } Mit der ersten Deklaration wird Spring konfiguriert. Der neue Task-Executor, den Spring an verschiedenen Stellen für asynchrone Aufrufe nutzt, erhält dafür jeweils einen neuen VirtualThread, statt wie vorher einen Thread-Pool. Die zweite Deklaration konfiguriert den eingebetteten Tomcat, mit dem Spring Boot die Web-Anfragen bearbeitet. Hier ist normalerweise ebenfalls ein Threadpool hinterlegt. Mit der Konfiguration fällt dieser Pool weg und es wird jedes Mal ein neuer VirtualThread zur Bearbeitung angelegt. Das als Configuration eingefügt und schon kommen Servlet-Requests bereits fertig als VirtualThread an. Spring Boot hat VirtualThreads auf dem Schirm, passt immer mal wieder etwas an und ist schon recht weit damit, VirtualThreads sehr effizient zu nutzen. Micronaut hat ebenfalls schon Support vorbereitet , der getestet werden kann. Und für Quarkus gibt es schon sehr weitreichenden Support . Und sogar in Wildfly 27 lässt sich VirtualThread-Support aktivieren. Angewohnheiten hinterfragen Mit Projekt Loom müssen wir fast nie neue Konzepte lernen. Stattdessen können wir alte Gewohnheiten ablegen: ThreadPools werden in den meisten Fällen keinen Mehrwert mehr bieten. Im Gegenteil fügen sie Overhead hinzu und verlangsamen den eigenen Code . Wo wir bisher Poolen, zum Beispiel um die Anzahl gleichzeitig durchgeführter Requests zu limitieren, können wir wieder (wie früher) Semaphoren beim Funktionsaufruf nutzen. Synchron war nie schlecht Und dann natürlich die Erkenntnis: für 99&#160;% aller Applikationen da draußen war asynchrone Programmierung nie nötig. Auch nicht ohne Projekt Loom. Die wenigsten haben mehr als 30.000 gleichzeitige Requests pro Service-Instanz. Moderne Hardware hat damit kein Problem, auch nicht mit 30k Betriebssystem-Threads. Und weil die Stack-Größe nur virtuellen Speicher angibt, haben wir auf 64-Bit-Systemen kein Problem damit. Ausblick: Structured Concurrency Bis mit Java 21 im Herbst 2023 das nächste LTS-Release aufschlägt, soll auch Structured Concurrency mit aufgenommen sein. Damit lassen sich dann die Stellen übersichtlich angehen, bei denen innerhalb einer Aufgabe Anfragen und Berechnungen parallel erfolgen sollen. @GetMapping(/trains) fun listTrainsParallel(): TrainList&lt;TrainRepresentation&gt; { val list = StructuredTaskScope.ShutdownOnSuccess&lt;List&lt;Train&gt;&gt;().use { scope -&gt; scope.fork { serverA.listActiveSync() } scope.fork { serverB.listActiveSync() } scope.join().result().map { it.toListRepresentation() } } val count = StructuredTaskScope.ShutdownOnSuccess&lt;Int&gt;().use { scope -&gt; scope.fork { serverA.countActiveSync() } scope.fork { serverB.countActiveSync() } scope.joinUntil(Instant.now().plusSeconds(15)).result() } return TrainList(list, count) } Bei den beiden Abfragen können wir einfach (übrigens wieder als Monade) deklarieren, dass die dahinter liegenden Abfragen in separaten Threads erfolgen - im besten Fall in VirtualThreads. ShutdownOnSuccess sorgt dafür, dass das erste verfügbare Ergebnis gewinnt und alle anderen Threads beendet werden. Wir können einen Timeout mitgeben, um die Laufzeit - hier auf 15 Sekunden - zu begrenzen. Dabei ist wichtig: Es geht bei Structured Concurrency wirklich fast nur um die Lesbarkeit und Wartbarkeit. Schneller oder Ressourcen-sparender wird es dadurch nicht. Also: Es wird spannend im Java-Ökosystem. Mit Projekt Loom werden tatsächlich die Karten neu gemischt. Endlich können wir den Programmierstil wieder so aussuchen, wie er zu unseren Gehirnen passt. "
},

{
    "id": 2,
    "uri": "blog/index.html",
    "menu": "Blog",
    "title": "Übersicht",
    "text": " Table of Contents Übersicht Übersicht Willkommen auf dem Tech-Blog der DB-Systel. "
},

{
    "id": 3,
    "uri": "lunrjsindex.html",
    "menu": "null",
    "title": "null",
    "text": " will be replaced by the index "
},

];
