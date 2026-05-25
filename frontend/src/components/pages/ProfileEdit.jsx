function ActionButton({ label, variant, onClick }) {
  const isSave = variant === "save";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: isSave ? 48 : 64,
        height: 26,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 4,
        paddingBottom: 4,
        background: isSave ? "#85B110" : "#8B8B8B",
        borderRadius: 4,
        border: "none",
        cursor: "pointer",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      <span
        style={{
          textAlign: "center",
          color: "black",
          fontSize: 14,
          fontFamily: "Google Sans Flex",
          fontWeight: "400",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function EditableField({ label, value, labelFont = "Google Sans Flex" }) {
  return (
    <div
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 14,
        display: "inline-flex",
      }}
    >
      <div>
        <span
          style={{
            color: "black",
            fontSize: 16,
            fontFamily: labelFont,
            fontWeight: "500",
          }}
        >
          {label}
        </span>
        <span
          style={{
            color: "black",
            fontSize: 16,
            fontFamily: "Google Sans Flex",
            fontWeight: "600",
          }}
        >
          :
        </span>
      </div>
      <div
        style={{
          height: 27,
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 5,
          paddingBottom: 5,
          background: "#D9D9D9",
          borderRadius: 7,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "black",
            fontSize: 16,
            fontFamily: "Google Sans Flex",
            fontWeight: "400",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function CourseTag({ label }) {
  return (
    <div
      style={{
        paddingLeft: 9,
        paddingRight: 9,
        paddingTop: 6,
        paddingBottom: 6,
        background: "#8FCE9C",
        borderRadius: 11,
        display: "inline-flex",
      }}
    >
      <div
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 2,
          display: "inline-flex",
        }}
      >
        <div
          style={{
            color: "black",
            fontSize: 16,
            fontFamily: "Google Sans Flex",
            fontWeight: "400",
          }}
        >
          {label}
        </div>
        <div
          style={{
            width: 16.07,
            height: 16.07,
            position: "relative",
            overflow: "hidden",
          }}
          aria-hidden
        >
          <div
            style={{
              width: 7.03,
              height: 7.03,
              left: 4.52,
              top: 4.52,
              position: "absolute",
              outline: "1px black solid",
              outlineOffset: "-0.50px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProfileEdit({ onDiscard, onSave }) {
  const apCourses = [
    "AP Statistics",
    "AP Chemistry",
    "AP World History",
    "AP Calculus AB",
    "AP Calculus BC",
  ];

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: "auto",
        padding: "20px 38px 48px",
        position: "relative",
        background: "white",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 870,
          margin: "0 auto",
          background: "rgba(129, 178, 232, 0.20)",
          borderRadius: 10,
          outline: "4px #2764A6 solid",
          outlineOffset: "-4px",
          padding: "53px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        <div
          style={{
            alignSelf: "stretch",
            justifyContent: "space-between",
            alignItems: "center",
            display: "inline-flex",
          }}
        >
          <div
            style={{
              color: "black",
              fontSize: 28,
              fontFamily: "Google Sans Flex",
              fontWeight: "400",
            }}
          >
            Welcome to your profile, Steve!
          </div>
          {onDiscard && (
            <button
              type="button"
              onClick={onDiscard}
              aria-label="Close"
              style={{
                width: 21,
                height: 21,
                position: "relative",
                overflow: "hidden",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 15.58,
                  height: 15.58,
                  left: 2.71,
                  top: 2.71,
                  position: "absolute",
                  outline: "4px black solid",
                  outlineOffset: "-2px",
                }}
              />
            </button>
          )}
        </div>

        <div
          style={{
            alignSelf: "stretch",
            minHeight: 237,
            paddingTop: 27,
            paddingBottom: 53,
            paddingLeft: 21,
            paddingRight: 8,
            background: "white",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            borderRadius: 25,
            outline: "2px #384B07 solid",
            outlineOffset: "-2px",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: 10,
            display: "flex",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 736,
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: 34,
              display: "flex",
            }}
          >
            <div
              style={{
                alignSelf: "stretch",
                height: 29,
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: 12,
                display: "inline-flex",
              }}
            >
              <div
                style={{
                  color: "black",
                  fontSize: 20,
                  fontFamily: "Google Sans Flex",
                  fontWeight: "600",
                }}
              >
                Profile Information
              </div>
              <div
                style={{
                  height: 29,
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: 7,
                  display: "flex",
                }}
              >
                <ActionButton label="Discard" onClick={onDiscard} />
                <ActionButton label="Save" variant="save" onClick={onSave} />
              </div>
            </div>

            <div
              style={{
                alignSelf: "stretch",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 42,
                display: "inline-flex",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: 9,
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    background: "#D9D9D9",
                    borderRadius: 9999,
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
                <div
                  style={{
                    color: "black",
                    fontSize: 36,
                    fontFamily: "Google Sans Flex",
                    fontWeight: "500",
                  }}
                >
                  🐻
                </div>
                <div
                  style={{
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 5,
                    display: "inline-flex",
                  }}
                >
                  <div
                    style={{
                      color: "black",
                      fontSize: 20,
                      fontFamily: "Google Sans Flex",
                      fontWeight: "500",
                    }}
                  >
                    Steve M.
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: "1 1 0",
                  minWidth: 280,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  gap: 9,
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 260,
                    padding: 10,
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 12,
                    display: "inline-flex",
                  }}
                >
                  <EditableField label="Name" value="Steve Man" />
                  <EditableField label="Major" value="Cognitive Science, B.S." />
                  <EditableField label="Minor" value="N/A" />
                </div>

                <div
                  style={{
                    width: 266,
                    padding: 10,
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 12,
                    display: "inline-flex",
                  }}
                >
                  <div
                    style={{
                      width: 196,
                      height: 27,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: 97,
                        left: 0,
                        top: 4,
                        position: "absolute",
                        color: "black",
                        fontSize: 16,
                        fontFamily: "Inter",
                        fontWeight: "500",
                      }}
                    >
                      Admit Term:
                    </div>
                    <div
                      style={{
                        height: 27,
                        paddingLeft: 10,
                        paddingRight: 10,
                        paddingTop: 5,
                        paddingBottom: 5,
                        left: 111,
                        top: 0,
                        position: "absolute",
                        background: "#D9D9D9",
                        borderRadius: 7,
                        justifyContent: "center",
                        alignItems: "center",
                        display: "inline-flex",
                      }}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          color: "black",
                          fontSize: 16,
                          fontFamily: "Google Sans Flex",
                          fontWeight: "400",
                        }}
                      >
                        Fall 2024
                      </div>
                    </div>
                  </div>
                  <EditableField
                    label="Admit Level"
                    value="Sophomore"
                    labelFont="Inter"
                  />
                  <EditableField
                    label="Graduation Term"
                    value="Spring 2028"
                    labelFont="Inter"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            alignSelf: "stretch",
            position: "relative",
            minHeight: 571,
          }}
        >
          <div
            style={{
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: 12,
              display: "inline-flex",
              marginBottom: 50,
            }}
          >
            <div
              style={{
                color: "black",
                fontSize: 20,
                fontFamily: "Google Sans Flex",
                fontWeight: "600",
              }}
            >
              Academic Information
            </div>
            <ActionButton label="Discard" onClick={onDiscard} />
            <ActionButton label="Save" variant="save" onClick={onSave} />
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: 790,
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: 14,
              display: "inline-flex",
            }}
          >
            <div
              style={{
                alignSelf: "stretch",
                padding: 20,
                background: "white",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                borderRadius: 20,
                outline: "2px #85B110 solid",
                outlineOffset: "-2px",
                justifyContent: "space-between",
                alignItems: "flex-start",
                display: "inline-flex",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 333,
                  minWidth: 240,
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  gap: 10,
                  display: "inline-flex",
                }}
              >
                <div
                  style={{
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 11,
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      color: "black",
                      fontSize: 20,
                      fontFamily: "Google Sans Flex",
                      fontWeight: "500",
                    }}
                  >
                    UCLA Courses Taken:
                  </div>
                  <div
                    style={{
                      color: "black",
                      fontSize: 16,
                      fontFamily: "Google Sans Flex",
                      fontWeight: "400",
                    }}
                  >
                    Courses update along with trees when a selected course is
                    marked as &ldquo;Completed&rdquo;.
                  </div>
                  <div>
                    <span
                      style={{
                        color: "#3E3E3E",
                        fontSize: 16,
                        fontFamily: "Google Sans Flex",
                        fontWeight: "400",
                      }}
                    >
                      For Major:{" "}
                    </span>
                    <span
                      style={{
                        color: "black",
                        fontSize: 16,
                        fontFamily: "Google Sans Flex",
                        fontWeight: "600",
                      }}
                    >
                      Cognitive Science
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: 393,
                  maxWidth: "100%",
                  padding: "19px 26px",
                  background:
                    "linear-gradient(0deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.50) 100%), #85B110",
                  borderRadius: 10,
                  outline: "1px #358162 solid",
                  outlineOffset: "-1px",
                  flexDirection: "column",
                  display: "inline-flex",
                }}
              >
                <div
                  style={{
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 21,
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      flexDirection: "column",
                      gap: 11,
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        color: "black",
                        fontSize: 16,
                        fontFamily: "Google Sans Flex",
                        fontWeight: "700",
                      }}
                    >
                      Completed Preparation Courses: (10/10)
                    </div>
                    <div
                      style={{
                        color: "black",
                        fontSize: 16,
                        fontFamily: "Google Sans Flex",
                        fontWeight: "400",
                      }}
                    >
                      LIFESCI 15
                      <br />
                      MATH 31B
                      <br />
                      PHILOS 7
                      <br />
                      LING 20
                      <br />
                      CS 31, CS 32
                      <br />
                      PSYCH 10, PSYCH 85, PSYCH 100A, PSYCH 100B
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        color: "black",
                        fontSize: 16,
                        fontFamily: "Google Sans Flex",
                        fontWeight: "700",
                      }}
                    >
                      Completed Major Courses: (0/10)
                    </div>
                    <div
                      style={{
                        color: "black",
                        fontSize: 16,
                        fontFamily: "Google Sans Flex",
                        fontWeight: "400",
                      }}
                    >
                      None yet!
                    </div>
                  </div>
                  <div
                    style={{
                      flexDirection: "column",
                      gap: 11,
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        color: "black",
                        fontSize: 16,
                        fontFamily: "Google Sans Flex",
                        fontWeight: "700",
                      }}
                    >
                      Completed General Education Courses: (7/12)
                    </div>
                    <div
                      style={{
                        color: "black",
                        fontSize: 16,
                        fontFamily: "Google Sans Flex",
                        fontWeight: "400",
                      }}
                    >
                      ANTHRO 4
                      <br />
                      PHILOS 7
                      <br />
                      JAPAN 70
                      <br />
                      RUSSN 90A
                      <br />
                      CLASSICS 20
                      <br />
                      ART&amp;ARC 10
                      <br />
                      EPSSCI 1
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                alignSelf: "stretch",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: 32,
                display: "inline-flex",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 371,
                  minWidth: 280,
                  flex: "1 1 320px",
                  padding: 20,
                  background: "white",
                  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                  borderRadius: 20,
                  outline: "2px #85B110 solid",
                  outlineOffset: "-2px",
                  flexDirection: "column",
                  gap: 10,
                  display: "inline-flex",
                }}
              >
                <div
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 11,
                    display: "flex",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      alignSelf: "stretch",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 11,
                      display: "inline-flex",
                    }}
                  >
                    <div
                      style={{
                        color: "black",
                        fontSize: 20,
                        fontFamily: "Inter",
                        fontWeight: "700",
                      }}
                    >
                      AP Classes Taken:
                    </div>
                    <button
                      type="button"
                      style={{
                        width: 84,
                        height: 26,
                        padding: "4px 6px",
                        background: "#2764A6",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                      }}
                    >
                      <span
                        style={{
                          color: "white",
                          fontSize: 14,
                          fontFamily: "Google Sans Flex",
                          fontWeight: "400",
                        }}
                      >
                        Add New
                      </span>
                    </button>
                  </div>
                  <div
                    style={{
                      color: "#3E3E3E",
                      fontSize: 16,
                      fontFamily: "Google Sans Flex",
                      fontWeight: "400",
                    }}
                  >
                    Saved list:
                  </div>
                  <div
                    style={{
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                      gap: 7,
                      display: "inline-flex",
                      flexWrap: "wrap",
                    }}
                  >
                    {apCourses.map((course) => (
                      <CourseTag key={course} label={course} />
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: 387,
                  minWidth: 280,
                  flex: "1 1 320px",
                  padding: 20,
                  background: "white",
                  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                  borderRadius: 20,
                  outline: "2px #85B110 solid",
                  outlineOffset: "-2px",
                  flexDirection: "column",
                  gap: 10,
                  display: "inline-flex",
                }}
              >
                <div
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 11,
                    display: "flex",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      alignSelf: "stretch",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 11,
                      display: "inline-flex",
                    }}
                  >
                    <div
                      style={{
                        color: "black",
                        fontSize: 20,
                        fontFamily: "Inter",
                        fontWeight: "700",
                      }}
                    >
                      IB Classes Taken:
                    </div>
                    <button
                      type="button"
                      style={{
                        width: 84,
                        height: 26,
                        padding: "4px 6px",
                        background: "#2764A6",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                      }}
                    >
                      <span
                        style={{
                          color: "white",
                          fontSize: 14,
                          fontFamily: "Google Sans Flex",
                          fontWeight: "400",
                        }}
                      >
                        Add New
                      </span>
                    </button>
                  </div>
                  <div
                    style={{
                      color: "#3E3E3E",
                      fontSize: 16,
                      fontFamily: "Google Sans Flex",
                      fontWeight: "400",
                    }}
                  >
                    Saved list:
                  </div>
                  <div
                    style={{
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                      gap: 7,
                      display: "inline-flex",
                      flexWrap: "wrap",
                    }}
                  >
                    {["IB Mathematics", "IB English"].map((course) => (
                      <CourseTag key={course} label={course} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
