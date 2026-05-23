function EditButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Edit"
      style={{
        width: 24,
        height: 24,
        border: "none",
        background: "transparent",
        cursor: onClick ? "pointer" : "default",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 13,
            height: 13,
            left: 4,
            top: 7,
            position: "absolute",
            outline: "2px black solid",
            outlineOffset: "-1px",
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            left: 9,
            top: 3,
            position: "absolute",
            outline: "2px black solid",
            outlineOffset: "-1px",
          }}
        />
      </div>
    </button>
  );
}

function FieldColumn({ fields }) {
  return (
    <div
      style={{
        width: 260,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 8,
        display: "inline-flex",
      }}
    >
      {fields.map(({ label, value }) => (
        <div key={label}>
          <div
            style={{
              color: "black",
              fontSize: 16,
              fontFamily: "Inter",
              fontWeight: "700",
              wordWrap: "break-word",
            }}
          >
            {label}:
          </div>
          <div
            style={{
              color: "black",
              fontSize: 16,
              fontFamily: "Inter",
              fontWeight: "400",
              wordWrap: "break-word",
            }}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

function CourseTag({ label, showRemove }) {
  const tagStyle = showRemove
    ? {
        paddingLeft: 9,
        paddingRight: 9,
        paddingTop: 6,
        paddingBottom: 6,
        background: "#8FCE9C",
        borderRadius: 11,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 10,
        display: "inline-flex",
      }
    : {
        height: 32,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        background: "#8FCE9C",
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        display: "flex",
      };

  return (
    <div style={tagStyle}>
      <div
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          gap: showRemove ? 2 : 0,
          display: "inline-flex",
        }}
      >
        <div
          style={{
            color: "black",
            fontSize: 16,
            fontFamily: showRemove ? "Google Sans Flex" : "Inter",
            fontWeight: "400",
            wordWrap: "break-word",
          }}
        >
          {label}
        </div>
        {showRemove && (
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
        )}
      </div>
    </div>
  );
}

export default function ProfileMain({ onBack, onEdit }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: "auto",
        padding: "32px 38px 48px",
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
          overflow: "hidden",
          padding: "53px 40px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        <div
          style={{
            width: "100%",
            position: "relative",
            minHeight: 39,
          }}
        >
          <div
            style={{
              color: "black",
              fontSize: 28,
              fontFamily: "Google Sans Flex",
              fontWeight: "400",
              wordWrap: "break-word",
            }}
          >
            Welcome to your profile, Steve!
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Close profile"
              style={{
                width: 21,
                height: 21,
                position: "absolute",
                right: 0,
                top: 9,
                overflow: "hidden",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
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
            width: "100%",
            padding: 20,
            background: "white",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            borderRadius: 25,
            outline: "2px #85B110 solid",
            outlineOffset: "-2px",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: 10,
            display: "inline-flex",
          }}
        >
          <div
            style={{
              width: "100%",
              paddingRight: 20,
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: 18,
              display: "flex",
            }}
          >
            <div
              style={{
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: 10,
                display: "inline-flex",
              }}
            >
              <div
                style={{
                  color: "black",
                  fontSize: 20,
                  fontFamily: "Google Sans Flex",
                  fontWeight: "600",
                  wordWrap: "break-word",
                }}
              >
                Profile Information
              </div>
              <EditButton onClick={onEdit} />
            </div>

            <div
              style={{
                width: "100%",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 40,
                display: "inline-flex",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: 15,
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
                      wordWrap: "break-word",
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
                  display: "flex",
                  gap: 40,
                  flexWrap: "wrap",
                }}
              >
                <FieldColumn
                  fields={[
                    { label: "Name", value: "Steve Man" },
                    { label: "Major", value: "Cognitive Science, B.S." },
                    { label: "Minor", value: "N/A" },
                  ]}
                />
                <FieldColumn
                  fields={[
                    { label: "Admit Term", value: "Fall 2024" },
                    { label: "Admit Level", value: "Sophomore" },
                    { label: "Graduation Term", value: "Spring 2028" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: 16,
            display: "inline-flex",
          }}
        >
          <div style={{ position: "relative", width: "100%" }}>
            <div
              style={{
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: 10,
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
                  wordWrap: "break-word",
                }}
              >
                Academic Information
              </div>
              <EditButton onClick={onEdit} />
            </div>

            <div
              style={{
                width: "100%",
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
                      alignSelf: "stretch",
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
                        wordWrap: "break-word",
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
                        wordWrap: "break-word",
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
                      gap: 21,
                      display: "flex",
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
                    <div
                      style={{
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
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
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
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
                  gap: 31,
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
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 10,
                    display: "inline-flex",
                  }}
                >
                  <div
                    style={{
                      alignSelf: "stretch",
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
                        fontFamily: "Inter",
                        fontWeight: "700",
                        wordWrap: "break-word",
                      }}
                    >
                      AP Classes Taken:
                    </div>
                    <div
                      style={{
                        color: "#3E3E3E",
                        fontSize: 16,
                        fontFamily: "Inter",
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
                        alignContent: "flex-start",
                      }}
                    >
                      {[
                        "AP Statistics",
                        "AP Chemistry",
                        "AP Calculus AB",
                        "AP Calculus BC",
                        "AP World History",
                      ].map((course) => (
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
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 10,
                    display: "inline-flex",
                  }}
                >
                  <div
                    style={{
                      alignSelf: "stretch",
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
                        fontFamily: "Inter",
                        fontWeight: "700",
                        wordWrap: "break-word",
                      }}
                    >
                      IB Classes Taken:
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
                        alignContent: "flex-start",
                      }}
                    >
                      {["IB Mathematics", "IB English"].map((course) => (
                        <CourseTag key={course} label={course} showRemove />
                      ))}
                    </div>
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
