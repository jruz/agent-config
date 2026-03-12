(ns log)

(defn ok [msg] (println (str "[\033[32mOK\033[0m] " msg)))
(defn info [msg] (println (str "[\033[34mINFO\033[0m] " msg)))
(defn warn [msg] (binding [*out* *err*] (println (str "[\033[33mWARN\033[0m] " msg))))
(defn error [msg] (binding [*out* *err*] (println (str "[\033[31mERROR\033[0m] " msg))))
